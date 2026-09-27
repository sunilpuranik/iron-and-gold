// Online rooms over Supabase. Leave the URL / key empty to run offline-only.
//
// Table: rooms(code text pk, lobby jsonb, state jsonb, seq int) — see supabase.sql.
// Every write bumps `seq` and only succeeds if nobody else wrote first
// (update … where seq = prev), so clients never clobber each other.

export const SUPABASE_URL = '';
export const SUPABASE_ANON_KEY = '';

export const onlineEnabled = !!(SUPABASE_URL && SUPABASE_ANON_KEY);

let client = null;
function db() {
  if (!onlineEnabled) throw new Error('Online play is not configured');
  if (!client) {
    require('react-native-url-polyfill/auto');
    const { createClient } = require('@supabase/supabase-js');
    client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return client;
}

const LETTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
function makeCode() {
  let c = '';
  for (let i = 0; i < 4; i++) c += LETTERS[Math.floor(Math.random() * LETTERS.length)];
  return c;
}

export function lobbyMember(profile) {
  return { id: profile.id, name: profile.name, avatar: profile.avatar, bot: false };
}

export async function createRoom(profile) {
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = makeCode();
    const lobby = { host: profile.id, players: [lobbyMember(profile)] };
    const { data, error } = await db().from('rooms').insert({ code, lobby, state: null, seq: 1 }).select().single();
    if (!error) return data;
    if (error.code !== '23505') throw new Error(error.message);
  }
  throw new Error('Could not find a free room code');
}

export async function fetchRoom(code) {
  const { data, error } = await db().from('rooms').select('*').eq('code', code).maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

// Optimistic write. Resolves { ok: true, row } or { ok: false, row: latest }.
export async function writeRoom(code, prevSeq, patch) {
  const { data, error } = await db()
    .from('rooms')
    .update({ ...patch, seq: prevSeq + 1, updated_at: new Date().toISOString() })
    .eq('code', code)
    .eq('seq', prevSeq)
    .select();
  if (error) throw new Error(error.message);
  if (data && data.length) return { ok: true, row: data[0] };
  return { ok: false, row: await fetchRoom(code) };
}

// Read-modify-write with retries. `fn(row)` returns a patch, or null to skip.
export async function mutateRoom(code, fn, tries = 4) {
  let row = await fetchRoom(code);
  for (let i = 0; i < tries; i++) {
    if (!row) throw new Error('Room not found');
    const patch = fn(row);
    if (!patch) return row;
    const res = await writeRoom(code, row.seq, patch);
    if (res.ok) return res.row;
    row = res.row;
  }
  throw new Error('The room is busy — try again');
}

export async function joinRoom(code, profile) {
  code = code.trim().toUpperCase();
  return mutateRoom(code, (row) => {
    const players = row.lobby.players;
    if (players.some((p) => p.id === profile.id)) return null;
    if (row.state) throw new Error('That game has already started');
    if (players.length >= 6) throw new Error('That table is full');
    return { lobby: { ...row.lobby, players: [...players, lobbyMember(profile)] } };
  });
}

export function subscribeRoom(code, onRow) {
  const channel = db()
    .channel('room-' + code)
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'rooms', filter: `code=eq.${code}` }, (payload) => {
      if (payload.new) onRow(payload.new);
    })
    .subscribe();
  return () => {
    db().removeChannel(channel);
  };
}

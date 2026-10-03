// Online rooms over Supabase. Leave the env vars unset to run offline-only.
//
// Each phone signs in anonymously once and keeps that session, so it is the same tycoon
// every time the app opens: that is what lets players close the app and rejoin their tables.
// Clients only read rooms. Lobby changes go through Postgres functions (supabase/migrations),
// game moves through the `game` Edge Function, which checks them with the engine.

export const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
export const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

export const onlineEnabled = !!(SUPABASE_URL && SUPABASE_ANON_KEY);

let client = null;
export function db() {
  if (!onlineEnabled) throw new Error('Online play is not configured');
  if (!client) {
    require('react-native-url-polyfill/auto');
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    const { createClient } = require('@supabase/supabase-js');
    client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        storage: AsyncStorage, persistSession: true, autoRefreshToken: true, detectSessionInUrl: false,
      },
    });
  }
  return client;
}

let signingIn = null;
// The signed-in user's id (a uuid), signing in anonymously the first time.
export function ensureSession() {
  if (!signingIn) {
    signingIn = (async () => {
      const { data } = await db().auth.getSession();
      if (data.session) return data.session.user.id;
      const res = await db().auth.signInAnonymously();
      if (res.error) throw new Error(res.error.message);
      return res.data.user.id;
    })().catch((e) => {
      signingIn = null;
      throw e;
    });
  }
  return signingIn;
}

async function rpc(name, args) {
  await ensureSession();
  const { data, error } = await db().rpc(name, args);
  if (error) throw new Error(error.message);
  return data;
}

export const createRoom = (profile, title) => rpc('create_room', {
  p_name: profile.name, p_avatar: profile.avatar, p_title: title?.trim() || null,
});
export const deleteRoom = (code) => rpc('delete_room', { p_code: code });
export const renameRoom = (code, title) => rpc('rename_room', { p_code: code, p_title: title?.trim() || null });
export const joinRoom = (code, profile) => rpc('join_room', { p_code: code.trim().toUpperCase(), p_name: profile.name, p_avatar: profile.avatar });
export const addBot = (code, name, avatar) => rpc('add_bot', { p_code: code, p_name: name, p_avatar: avatar });
export const removePlayer = (code, id) => rpc('remove_player', { p_code: code, p_id: id });

export async function fetchRoom(code) {
  await ensureSession();
  const { data, error } = await db().from('rooms').select('*').eq('code', code).maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

// Tables I sit at that are still going (RLS already limits rooms to mine), newest first.
export async function listMyRooms() {
  await ensureSession();
  const { data, error } = await db()
    .from('rooms')
    .select('code, title, lobby, status, turn_of, seq, updated_at')
    .neq('status', 'over')
    .order('updated_at', { ascending: false })
    .limit(20);
  if (error) throw new Error(error.message);
  return data;
}

export class GameOpError extends Error {
  constructor(message, status, row) {
    super(message);
    this.status = status;
    this.row = row || null;
  }
}

// Ask the server to start the game, play my move, or move the bot whose turn it is.
// Resolves to the updated room row; rejects with GameOpError (with the latest row on 409).
export async function gameOp(code, op, seq, action) {
  await ensureSession();
  const { data, error } = await db().functions.invoke('game', { body: { code, op, seq, action } });
  if (!error) return data;
  let body = null;
  try {
    body = await error.context.json();
  } catch {
    // network failure or a non-JSON reply
  }
  throw new GameOpError(body?.error || error.message || 'Network error', error.context?.status || 0, body?.row);
}

export function subscribeRoom(code, onRow) {
  const channel = db()
    .channel('room-' + code)
    .on('postgres_changes', {
      event: 'UPDATE', schema: 'public', table: 'rooms', filter: `code=eq.${code}`,
    }, (payload) => {
      if (payload.new) onRow(payload.new);
    })
    .subscribe();
  return () => {
    db().removeChannel(channel);
  };
}

// Is it this user's move at this table? `turn_of` is written by the server on every move.
export function myTurnAt(row, uid) {
  return row.status === 'playing' && row.turn_of === uid;
}

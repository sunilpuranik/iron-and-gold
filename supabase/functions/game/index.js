// The only writer of game state. Checks who is calling, replays the move with the same engine
// the app uses (copied into ../_shared by `npm run sync:engine`), and writes it only if nobody
// else wrote first.
//
// POST { code, op: 'start' | 'move' | 'bot', seq, action? } with the player's Authorization header.
// 200 → the updated room row. 4xx → { error, row? } where row is the latest room when it moved on.
import { createClient } from 'npm:@supabase/supabase-js@2';
import { resolveOp } from '../_shared/net/gameOps.js';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

const admin = createClient(Deno.env.get('SUPABASE_URL'), Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'), {
  auth: { persistSession: false },
});

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'POST only' }, 405);

  const jwt = (req.headers.get('Authorization') || '').replace(/^Bearer /, '');
  const { data: auth } = await admin.auth.getUser(jwt);
  const uid = auth?.user?.id;
  if (!uid) return json({ error: 'Sign in first' }, 401);

  let body;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Bad request' }, 400);
  }
  const code = String(body.code || '').toUpperCase();

  const { data: row, error } = await admin.from('rooms').select('*').eq('code', code).maybeSingle();
  if (error) return json({ error: error.message }, 500);

  const res = resolveOp(row, uid, body);
  if (!res.ok) return json({ error: res.error, row: res.status === 409 ? row : undefined }, res.status);

  // Guarded write: only lands if the row is still at the seq we read.
  const { data: written, error: werr } = await admin
    .from('rooms').update(res.patch).eq('code', code).eq('seq', row.seq).select().maybeSingle();
  if (werr) return json({ error: werr.message }, 500);
  if (!written) {
    const { data: latest } = await admin.from('rooms').select('*').eq('code', code).maybeSingle();
    return json({ error: 'The table moved on', row: latest }, 409);
  }
  return json(written);
});

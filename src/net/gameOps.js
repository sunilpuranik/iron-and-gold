// Server-side rules for online rooms. Pure: the `game` Edge Function runs this on the room row it
// loaded, and the jest tests run it directly. The client never writes game state itself.
//
// request: { op: 'start' | 'move' | 'bot', seq, action? }
// returns: { ok: true, patch } to write (guarded by `seq`), or { ok: false, status, error }.
import { actorOf, applyAction, botAction, newGame } from '../game/engine.js';

export const MAX_PLAYERS = 6;

const fail = (status, error) => ({ ok: false, status, error });

export function statusOf(state) {
  if (!state) return 'lobby';
  return state.phase === 'over' ? 'over' : 'playing';
}

// The patch every successful op writes; `seq` is bumped by the caller's guarded update.
function withState(row, state) {
  return {
    ok: true,
    patch: {
      state, seq: row.seq + 1, status: statusOf(state), turn_of: state.phase === 'over' ? null : state.players[actorOf(state)].id,
    },
  };
}

export function resolveOp(row, uid, request, opts = {}) {
  if (!row) return fail(404, 'Room not found');
  if (!uid) return fail(401, 'Sign in first');
  const players = row.lobby?.players || [];
  if (!players.some((p) => p.id === uid && !p.bot)) return fail(403, 'You are not at this table');
  const { op, seq, action } = request || {};
  // A stale client learns about it here and refreshes instead of acting on an old board.
  if (seq != null && seq !== row.seq) return fail(409, 'The table moved on');

  if (op === 'start') {
    if (row.state) return fail(409, 'The game has already started');
    if (row.lobby.host !== uid) return fail(403, 'Only the host can start');
    if (players.length < 2) return fail(400, 'Need 2 tycoons to start');
    return withState(row, newGame(players, { seed: opts.seed }));
  }

  const { state } = row;
  if (!state) return fail(409, 'The game has not started');
  if (state.phase === 'over') return fail(409, 'The game is over');

  if (op === 'move') {
    const seat = state.players.findIndex((p) => p.id === uid);
    if (seat < 0) return fail(403, 'You have no seat in this game');
    if (actorOf(state) !== seat) return fail(409, 'It is not your move');
    const next = applyAction(state, seat, action);
    if (!next) return fail(422, 'That move is not allowed');
    return withState(row, next);
  }

  // Any tycoon at the table can nudge a bot; the seq guard makes duplicate nudges harmless.
  if (op === 'bot') {
    const seat = actorOf(state);
    if (!state.players[seat].bot) return fail(409, 'It is not a bot’s move');
    const next = applyAction(state, seat, botAction(state));
    if (!next) return fail(500, 'The bot could not move');
    return withState(row, next);
  }

  return fail(400, 'Unknown op');
}

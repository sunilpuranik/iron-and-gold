// The server's referee: who may start, move and nudge bots, and what it writes.
import { resolveOp, statusOf } from '../src/net/gameOps';
import { actorOf, applyAction, botAction } from '../src/game/engine';

const HOST = 'uid-host';
const GUEST = 'uid-guest';
const STRANGER = 'uid-stranger';

function lobbyRow(players) {
  return {
    code: 'ABCD', seq: 5, state: null, lobby: { host: HOST, players },
  };
}

const humans = [{ id: HOST, name: 'Host', avatar: 0 }, { id: GUEST, name: 'Guest', avatar: 1 }];
const withBot = [...humans, { id: 'bot-x', name: 'Col. Barlow', avatar: 2, bot: true }];

// A started room at its seq, as the server would store it.
function started(players = humans, seed = 3) {
  const res = resolveOp(lobbyRow(players), HOST, { op: 'start', seq: 5 }, { seed });
  expect(res.ok).toBe(true);
  return { ...lobbyRow(players), ...res.patch };
}

describe('start', () => {
  test('the host deals a game for everyone in the lobby', () => {
    const res = resolveOp(lobbyRow(humans), HOST, { op: 'start', seq: 5 }, { seed: 1 });
    expect(res.ok).toBe(true);
    expect(res.patch.seq).toBe(6);
    expect(res.patch.status).toBe('playing');
    expect(res.patch.state.players.map((p) => p.id).sort()).toEqual([GUEST, HOST].sort());
    expect(res.patch.turn_of).toBe(res.patch.state.players[actorOf(res.patch.state)].id);
  });

  test.each([
    ['a guest', GUEST, humans, 403],
    ['a stranger', STRANGER, humans, 403],
    ['nobody signed in', null, humans, 401],
    ['the host alone', HOST, [humans[0]], 400],
  ])('%s cannot start', (_, uid, players, status) => {
    expect(resolveOp(lobbyRow(players), uid, { op: 'start', seq: 5 })).toMatchObject({ ok: false, status });
  });

  test('a started game cannot be dealt again', () => {
    const row = started();
    expect(resolveOp(row, HOST, { op: 'start', seq: row.seq })).toMatchObject({ ok: false, status: 409 });
  });

  test('a missing room is a 404', () => {
    expect(resolveOp(null, HOST, { op: 'start' })).toMatchObject({ ok: false, status: 404 });
  });
});

describe('move', () => {
  test('the tycoon whose turn it is can play a legal deed', () => {
    const row = started();
    const seat = actorOf(row.state);
    const uid = row.state.players[seat].id;
    const action = botAction(row.state);
    const res = resolveOp(row, uid, { op: 'move', seq: row.seq, action });
    expect(res.ok).toBe(true);
    // Exactly what the client computed optimistically.
    expect(res.patch.state).toEqual(applyAction(row.state, seat, action));
    expect(res.patch.seq).toBe(row.seq + 1);
  });

  test('the other tycoon is told to wait', () => {
    const row = started();
    const other = row.state.players[1 - actorOf(row.state)].id;
    expect(resolveOp(row, other, { op: 'move', seq: row.seq, action: botAction(row.state) }))
      .toMatchObject({ ok: false, status: 409, error: 'It is not your move' });
  });

  test('illegal moves are refused with 422', () => {
    const row = started();
    const uid = row.state.players[actorOf(row.state)].id;
    expect(resolveOp(row, uid, { op: 'move', seq: row.seq, action: { type: 'place', tile: 'Z99' } }))
      .toMatchObject({ ok: false, status: 422 });
  });

  test('a move made against an old board is a 409, not a silent overwrite', () => {
    const row = started();
    const uid = row.state.players[actorOf(row.state)].id;
    expect(resolveOp(row, uid, { op: 'move', seq: row.seq - 1, action: botAction(row.state) }))
      .toMatchObject({ ok: false, status: 409 });
  });

  test('strangers cannot move even if they know the code', () => {
    const row = started();
    expect(resolveOp(row, STRANGER, { op: 'move', seq: row.seq, action: botAction(row.state) }))
      .toMatchObject({ ok: false, status: 403 });
  });

  test('nobody can move before the deal', () => {
    expect(resolveOp(lobbyRow(humans), HOST, { op: 'move', seq: 5, action: { type: 'buy', cart: {} } }))
      .toMatchObject({ ok: false, status: 409 });
  });

  test('a player cannot pretend to be a bot by using its id', () => {
    const row = started(withBot);
    expect(resolveOp(row, 'bot-x', { op: 'bot', seq: row.seq })).toMatchObject({ ok: false, status: 403 });
  });
});

describe('bots', () => {
  test('any tycoon at the table can nudge the bot whose turn it is', () => {
    let row = started(withBot, 12);
    // Advance with humans playing like bots until a real bot must act.
    while (!row.state.players[actorOf(row.state)].bot) {
      const uid = row.state.players[actorOf(row.state)].id;
      const res = resolveOp(row, uid, { op: 'move', seq: row.seq, action: botAction(row.state) });
      row = { ...row, ...res.patch };
    }
    const res = resolveOp(row, GUEST, { op: 'bot', seq: row.seq });
    expect(res.ok).toBe(true);
    expect(res.patch.state.seq).toBe(row.state.seq + 1);
  });

  test('bots cannot be nudged on a human turn', () => {
    const row = started(humans);
    expect(resolveOp(row, HOST, { op: 'bot', seq: row.seq })).toMatchObject({ ok: false, status: 409 });
  });

  test('a whole game with bots can be refereed to the end', () => {
    let row = started(withBot, 21);
    for (let i = 0; row.status !== 'over'; i++) {
      if (i > 5000) throw new Error('did not finish');
      const seat = actorOf(row.state);
      const p = row.state.players[seat];
      const res = p.bot
        ? resolveOp(row, HOST, { op: 'bot', seq: row.seq })
        : resolveOp(row, p.id, { op: 'move', seq: row.seq, action: botAction(row.state) });
      expect(res.ok).toBe(true);
      row = { ...row, ...res.patch };
    }
    expect(row.turn_of).toBeNull();
    expect(resolveOp(row, HOST, { op: 'bot', seq: row.seq })).toMatchObject({ ok: false, status: 409 });
  });
});

test('unknown ops are refused', () => {
  const row = started();
  expect(resolveOp(row, HOST, { op: 'delete', seq: row.seq })).toMatchObject({ ok: false, status: 400 });
});

test('statusOf', () => {
  expect(statusOf(null)).toBe('lobby');
  expect(statusOf({ phase: 'place' })).toBe('playing');
  expect(statusOf({ phase: 'over' })).toBe('over');
});

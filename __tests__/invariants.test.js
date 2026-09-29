// Properties that must hold on every step of every game. The server trusts these:
// it replays client moves with the same engine, so the engine must be deterministic,
// pure, JSON-safe and conserve tiles, shares and money.
import {
  actorOf, applyAction, botAction, newGame, sizes,
} from '../src/game/engine';
import { COMPANY_IDS, SHARES_PER_COMPANY, TILES } from '../src/game/data';

const bots = (n) => Array.from({ length: n }, (_, i) => ({ id: 'p' + i, name: 'P' + i, bot: true }));

// Plays a bots-only game and calls `check(prev, action, next)` on every step.
function playOut(n, seed, check) {
  let s = newGame(bots(n), { seed });
  for (let step = 0; s.phase !== 'over'; step++) {
    if (step > 5000) throw new Error('game did not end');
    const action = botAction(s);
    const next = applyAction(s, actorOf(s), action);
    if (!next) throw new Error(`illegal bot action ${JSON.stringify(action)} in ${s.phase}`);
    check(s, action, next);
    s = next;
  }
  return s;
}

function checkTiles(s) {
  const all = [...s.pool, ...Object.keys(s.board), ...s.players.flatMap((p) => p.hand), ...(s.dead || [])];
  const unique = new Set(all);
  expect(unique.size).toBe(all.length);
  for (const t of unique) expect(TILES).toContain(t);
  expect(Object.keys(s.board).length + s.pool.length).toBeLessThanOrEqual(TILES.length);
}

function checkShares(s) {
  for (const co of COMPANY_IDS) {
    const held = s.players.reduce((n, p) => n + p.shares[co], 0);
    expect(held + s.bank[co]).toBe(SHARES_PER_COMPANY);
    expect(s.bank[co]).toBeGreaterThanOrEqual(0);
  }
}

function checkMoney(s) {
  for (const p of s.players) {
    expect(Number.isInteger(p.cash)).toBe(true);
    expect(p.cash).toBeGreaterThanOrEqual(0);
    expect(p.cash % 100).toBe(0);
  }
}

describe.each([2, 3, 4, 5, 6])('%i tycoons', (n) => {
  test.each([1, 2, 3])('seed %i: tiles, shares and cash are conserved on every step', (seed) => {
    const end = playOut(n, seed * 31 + n, (prev, action, next) => {
      checkTiles(next);
      checkShares(next);
      checkMoney(next);
      expect(next.seq).toBeGreaterThan(prev.seq);
    });
    // At the bell every share is sold back.
    for (const p of end.players) for (const co of COMPANY_IDS) expect(p.shares[co]).toBe(0);
  });
});

test('hands never exceed six deeds', () => {
  playOut(4, 99, (prev, action, next) => {
    for (const p of next.players) expect(p.hand.length).toBeLessThanOrEqual(6);
  });
});

test('companies only exist with 2+ plots, and never more than seven at once', () => {
  playOut(5, 17, (prev, action, next) => {
    const sz = sizes(next);
    const active = COMPANY_IDS.filter((co) => sz[co] > 0);
    expect(active.length).toBeLessThanOrEqual(7);
    for (const co of active) expect(sz[co]).toBeGreaterThanOrEqual(2);
  });
});

test('applyAction never mutates the state it is given', () => {
  playOut(3, 5, (prev) => {
    // playOut already moved on; re-apply to a frozen deep copy to prove purity.
    const frozen = JSON.parse(JSON.stringify(prev));
    const deepFreeze = (o) => {
      Object.values(o).forEach((v) => v && typeof v === 'object' && deepFreeze(v));
      return Object.freeze(o);
    };
    deepFreeze(frozen);
    expect(() => applyAction(frozen, actorOf(frozen), botAction(frozen))).not.toThrow();
  });
});

test('replaying the same actions from the same deal gives the same game (client/server agreement)', () => {
  const actions = [];
  const a = playOut(4, 2024, (prev, action) => actions.push(action));
  let b = newGame(bots(4), { seed: 2024 });
  for (const action of actions) b = applyAction(b, actorOf(b), action);
  expect(b).toEqual(a);
});

test('state survives a JSON round trip on every step (it is stored as jsonb)', () => {
  playOut(3, 8, (prev, action, next) => {
    const copy = JSON.parse(JSON.stringify(next));
    expect(copy).toEqual(next);
    // …and the engine keeps working from the copy.
    if (copy.phase !== 'over') expect(applyAction(copy, actorOf(copy), botAction(copy))).not.toBeNull();
  });
});

describe('illegal input is rejected, not thrown', () => {
  const s = newGame(bots(3), { seed: 4 });
  const me = actorOf(s);
  test.each([
    ['unknown type', { type: 'teleport' }],
    ['deed not in hand', { type: 'place', tile: TILES.find((t) => !s.players[me].hand.includes(t)) }],
    ['wrong phase', { type: 'buy', cart: {} }],
    ['missing action', null],
    ['garbage tile', { type: 'place', tile: '<script>' }],
  ])('%s', (_, action) => {
    expect(applyAction(s, me, action)).toBeNull();
  });

  test('any seat but the actor is refused', () => {
    for (let seat = -1; seat <= 3; seat++) {
      if (seat === me) continue;
      expect(applyAction(s, seat, botAction(s))).toBeNull();
    }
  });

  test('buying more than three shares, negative shares or beyond your cash is refused', () => {
    // Play on until someone is on the buy step with a company on the board.
    let t = newGame(bots(3), { seed: 4 });
    while (!(t.phase === 'buy' && COMPANY_IDS.some((c) => sizes(t)[c] > 0))) t = applyAction(t, actorOf(t), botAction(t));
    const seat = actorOf(t);
    const co = COMPANY_IDS.find((c) => sizes(t)[c] > 0);
    expect(applyAction(t, seat, { type: 'buy', cart: { [co]: 4 } })).toBeNull();
    expect(applyAction(t, seat, { type: 'buy', cart: { [co]: -1 } })).toBeNull();
    expect(applyAction(t, seat, { type: 'buy', cart: { zz: 1 } })).toBeNull();
    const broke = JSON.parse(JSON.stringify(t));
    broke.players[seat].cash = 0;
    expect(applyAction(broke, seat, { type: 'buy', cart: { [co]: 1 } })).toBeNull();
    expect(applyAction(t, seat, { type: 'buy', cart: { [co]: 1 } })).not.toBeNull();
  });
});

test('newGame refuses fewer than 2 or more than 6 tycoons', () => {
  expect(() => newGame(bots(1))).toThrow();
  expect(() => newGame(bots(7))).toThrow();
});

test('the same seed deals the same game; seats are shuffled but keep their ids', () => {
  const a = newGame(bots(5), { seed: 11 });
  const b = newGame(bots(5), { seed: 11 });
  expect(a).toEqual(b);
  expect(a.players.map((p) => p.id).sort()).toEqual(bots(5).map((p) => p.id));
});

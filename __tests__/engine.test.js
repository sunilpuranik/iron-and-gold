import {
  actorOf, applyAction, bonusesFor, botAction, canClose, classify, effectOf, newGame, price, sizes,
} from '../src/game/engine';
import { COMPANY_IDS, TILES } from '../src/game/data';

const PLAYERS = [
  { id: 'a', name: 'Ada' },
  { id: 'b', name: 'Bo' },
  { id: 'c', name: 'Cy' },
];

// A deterministic game with an empty board that we can arrange by hand.
function blank(n = 3) {
  const s = newGame(PLAYERS.slice(0, n).concat(n > 3 ? [{ id: 'd', name: 'Di' }] : []), { seed: 7 });
  s.board = {};
  s.log = [];
  s.turn = 0;
  s.phase = 'place';
  s.idle = 0;
  const used = new Set();
  const take = () => {
    const t = TILES.find((x) => !used.has(x) && !s.board[x]);
    used.add(t);
    return t;
  };
  s.players.forEach((p) => { p.hand = []; });
  s.pool = TILES.slice();
  s._take = take;
  return s;
}

function setBoard(s, map) {
  for (const [co, tiles] of Object.entries(map)) for (const t of tiles) s.board[t] = co;
  s.pool = s.pool.filter((t) => !s.board[t]);
}

function give(s, seat, tiles) {
  s.players[seat].hand = tiles;
  s.pool = s.pool.filter((t) => !tiles.includes(t));
}

function run(s, ...actions) {
  let cur = s;
  for (const a of actions) {
    const next = applyAction(cur, actorOf(cur), a);
    if (!next) throw new Error('illegal ' + JSON.stringify(a) + ' in ' + cur.phase);
    cur = next;
  }
  return cur;
}

describe('pricing', () => {
  test('price follows size bracket and tier', () => {
    expect(price('cw', 2)).toBe(200);
    expect(price('cw', 5)).toBe(500);
    expect(price('cw', 6)).toBe(600);
    expect(price('cw', 10)).toBe(600);
    expect(price('pw', 11)).toBe(800);
    expect(price('ft', 41)).toBe(1200);
    expect(price('ft', 1)).toBe(0);
  });
});

describe('new game', () => {
  test('deals cash, deeds and one surveyed plot per tycoon', () => {
    const s = newGame(PLAYERS, { seed: 1 });
    expect(s.players).toHaveLength(3);
    for (const p of s.players) {
      expect(p.cash).toBe(6000);
      expect(p.hand).toHaveLength(6);
    }
    expect(Object.keys(s.board)).toHaveLength(3);
    expect(s.pool).toHaveLength(108 - 3 - 18);
    const all = [...s.pool, ...Object.keys(s.board), ...s.players.flatMap((p) => p.hand)];
    expect(new Set(all).size).toBe(108);
  });

  test('rejects actions from the wrong seat', () => {
    const s = newGame(PLAYERS, { seed: 1 });
    const other = (s.turn + 1) % 3;
    expect(applyAction(s, other, { type: 'place', tile: s.players[other].hand[0] })).toBeNull();
  });
});

describe('founding', () => {
  test('touching a loose plot charters a company with a founder share', () => {
    const s = blank();
    setBoard(s, { x: ['A1', 'A2'] });
    give(s, 0, ['A3', 'I12']);
    expect(classify(s, 'A3').kind).toBe('found');
    expect(effectOf(s, 'A3')).toBe('Charters a company');
    let t = run(s, { type: 'place', tile: 'A3' });
    expect(t.phase).toBe('found');
    expect(applyAction(t, 0, { type: 'found', company: 'zz' })).toBeNull();
    t = run(t, { type: 'found', company: 'pw' });
    expect(sizes(t).pw).toBe(3);
    expect(t.players[0].shares.pw).toBe(1);
    expect(t.bank.pw).toBe(24);
    expect(t.phase).toBe('buy');
    expect(t.fx).toMatchObject({ kind: 'found', id: 'pw', tile: 'A3' });
  });

  test('an 8th company cannot be chartered', () => {
    const s = blank();
    const rows = 'ABCDEFGHI';
    COMPANY_IDS.forEach((co, i) => setBoard(s, { [co]: [rows[i] + '11', rows[i] + '12'] }));
    setBoard(s, { x: ['A1'] });
    give(s, 0, ['A2']);
    expect(classify(s, 'A2').kind).toBe('blocked');
    expect(applyAction(s, 0, { type: 'place', tile: 'A2' })).toBeNull();
  });
});

describe('growth', () => {
  test('flood-fills connected loose plots into the company', () => {
    const s = blank();
    setBoard(s, { rm: ['A1', 'A2'], x: ['A4', 'A5', 'B5', 'I12'] });
    give(s, 0, ['A3']);
    expect(effectOf(s, 'A3')).toBe('Grows Red Mesa → 6');
    const t = run(s, { type: 'place', tile: 'A3' });
    expect(sizes(t).rm).toBe(6);
    expect(t.board.I12).toBe('x');
    expect(t.fx.kind).toBe('build');
  });
});

describe('buyouts', () => {
  function threeWay() {
    // pw (5) above, cw (4) left, pp (3) right of E5.
    const s = blank();
    setBoard(s, {
      pw: ['E4', 'E3', 'E2', 'E1', 'F1'],
      cw: ['D5', 'C5', 'B5', 'A5'],
      pp: ['F5', 'G5', 'H5'],
    });
    give(s, 0, ['E5']);
    s.players[0].shares = { ...s.players[0].shares, cw: 4, pp: 3 };
    s.players[1].shares = { ...s.players[1].shares, cw: 2, pp: 3 };
    s.players[2].shares = { ...s.players[2].shares, cw: 1 };
    s.bank.cw = 18;
    s.bank.pp = 19;
    return s;
  }

  test('3-way buyout: largest survives, bonuses paid largest first, then shares settled', () => {
    const s = threeWay();
    expect(effectOf(s, 'E5')).toBe('Buyout: P&W absorbs Wire, Packet');
    let t = run(s, { type: 'place', tile: 'E5' });
    expect(t.phase).toBe('dispose');
    expect(sizes(t)).toMatchObject({ pw: 13, cw: 0, pp: 0 });
    // cw size 4 → $400: Ada majority 4000, Bo minority 2000.
    // pp size 3 → $300: Ada & Bo tie 3 each → split 4500 → 2300 each (rounded up).
    expect(t.players[0].cash).toBe(6000 + 4000 + 2300);
    expect(t.players[1].cash).toBe(6000 + 2000 + 2300);
    expect(t.players[2].cash).toBe(6000);
    expect(t.pending.absorbed.map((a) => a.co)).toEqual(['cw', 'pp']);
    expect(t.pending.queue).toEqual([
      { co: 'cw', seat: 0 }, { co: 'cw', seat: 1 }, { co: 'cw', seat: 2 },
      { co: 'pp', seat: 0 }, { co: 'pp', seat: 1 },
    ]);
    // Odd swap is illegal; selling more than held is illegal.
    expect(applyAction(t, 0, { type: 'dispose', sell: 0, trade: 3 })).toBeNull();
    expect(applyAction(t, 0, { type: 'dispose', sell: 5, trade: 0 })).toBeNull();
    t = run(t,
      { type: 'dispose', sell: 0, trade: 4 }, // Ada swaps 4 cw → 2 pw
      { type: 'dispose', sell: 2, trade: 0 }, // Bo sells 2 cw at $400
      { type: 'dispose', sell: 0, trade: 0 }, // Cy holds
      { type: 'dispose', sell: 1, trade: 2 }, // Ada: sell 1 pp, swap 2
      { type: 'dispose', sell: 3, trade: 0 }); // Bo sells 3 pp
    expect(t.phase).toBe('buy');
    expect(t.players[0].shares).toMatchObject({ pw: 3, cw: 0, pp: 0 });
    expect(t.players[1].cash).toBe(10300 + 800 + 900);
    expect(t.players[2].shares.cw).toBe(1);
    expect(t.bank.pw).toBe(22);
    expect(t.bank.cw).toBe(24);
  });

  test('tied largest companies let the placer choose the survivor', () => {
    const s = blank();
    setBoard(s, { pw: ['E4', 'E3', 'E2'], rm: ['F5', 'G5', 'H5'] });
    give(s, 0, ['E5']);
    let t = run(s, { type: 'place', tile: 'E5' });
    expect(t.phase).toBe('survivor');
    expect(applyAction(t, 0, { type: 'survivor', company: 'cw' })).toBeNull();
    t = run(t, { type: 'survivor', company: 'rm' });
    expect(sizes(t)).toMatchObject({ rm: 7, pw: 0 });
    expect(t.phase).toBe('buy'); // nobody held pw
  });

  test('swaps are limited by the survivor bank', () => {
    const s = threeWay();
    s.bank.pw = 1;
    const t = run(s, { type: 'place', tile: 'E5' });
    expect(applyAction(t, 0, { type: 'dispose', sell: 0, trade: 4 })).toBeNull();
    expect(applyAction(t, 0, { type: 'dispose', sell: 2, trade: 2 })).not.toBeNull();
  });
});

describe('bonus splits', () => {
  const withShares = (counts) => {
    const s = blank(4);
    counts.forEach((n, i) => { s.players[i].shares.pw = n; });
    return s;
  };

  test('sole holder takes both bonuses', () => {
    expect(bonusesFor(withShares([3, 0, 0, 0]), 'pw', 500)).toEqual([{ seat: 0, amount: 7500, kind: 'sole' }]);
  });

  test('majority and minority', () => {
    const b = bonusesFor(withShares([5, 2, 1, 0]), 'pw', 500);
    expect(b).toEqual([
      { seat: 0, amount: 5000, kind: 'majority' },
      { seat: 1, amount: 2500, kind: 'minority' },
    ]);
  });

  test('tied majority splits both bonuses, rounded up to $100', () => {
    const b = bonusesFor(withShares([4, 4, 4, 1]), 'pw', 700);
    // (7000 + 3500) / 3 = 3500 → 3500
    expect(b.map((x) => x.amount)).toEqual([3500, 3500, 3500]);
    const b2 = bonusesFor(withShares([4, 4, 0, 0]), 'pw', 300);
    // 4500 / 2 = 2250 → 2300
    expect(b2.map((x) => x.amount)).toEqual([2300, 2300]);
  });

  test('tied minority splits the minority bonus, rounded up', () => {
    const b = bonusesFor(withShares([6, 2, 2, 2]), 'pw', 400);
    // minority 2000 / 3 = 666.7 → 700
    expect(b).toEqual([
      { seat: 0, amount: 4000, kind: 'majority' },
      { seat: 1, amount: 700, kind: 'tied minority' },
      { seat: 2, amount: 700, kind: 'tied minority' },
      { seat: 3, amount: 700, kind: 'tied minority' },
    ]);
  });
});

describe('trusts', () => {
  const trust = (row) => Array.from({ length: 11 }, (_, i) => row + (i + 1));

  test('a trust cannot be absorbed — it survives any buyout', () => {
    const s = blank();
    setBoard(s, { cr: trust('A'), cw: ['C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8', 'C9', 'C10'] });
    give(s, 0, ['B1']);
    const t = run(s, { type: 'place', tile: 'B1' });
    expect(sizes(t)).toMatchObject({ cr: 22, cw: 0 });
  });

  test('a deed joining two trusts is dead and replaced at the start of the turn', () => {
    const s = blank();
    setBoard(s, { cr: trust('A'), ft: trust('C') });
    give(s, 1, ['B5', 'I1', 'I3', 'I5', 'I7', 'I9']);
    give(s, 0, ['I11']);
    expect(classify(s, 'B5').kind).toBe('dead');
    expect(effectOf(s, 'B5')).toMatch(/Dead/);
    s.phase = 'buy';
    const t = run(s, { type: 'buy', cart: {} });
    expect(t.turn).toBe(1);
    expect(t.players[1].hand).not.toContain('B5');
    expect(t.players[1].hand).toHaveLength(6);
    expect(t.log.some((l) => /retires dead deed B5/.test(l.text))).toBe(true);
  });
});

describe('buying', () => {
  test('buys up to 3 shares of active companies within cash', () => {
    const s = blank();
    setBoard(s, { pw: ['A1', 'A2', 'A3'], rm: ['I1', 'I2'] });
    s.phase = 'buy';
    expect(applyAction(s, 0, { type: 'buy', cart: { pw: 2, rm: 2 } })).toBeNull();
    expect(applyAction(s, 0, { type: 'buy', cart: { cw: 1 } })).toBeNull();
    s.players[0].cash = 500;
    expect(applyAction(s, 0, { type: 'buy', cart: { pw: 2 } })).toBeNull();
    const t = applyAction(s, 0, { type: 'buy', cart: { rm: 1 } });
    expect(t.players[0].cash).toBe(200);
    expect(t.players[0].shares.rm).toBe(1);
    expect(t.turn).toBe(1);
  });
});

describe('end conditions', () => {
  test('the closing bell may ring at 41+ plots and pays final bonuses', () => {
    const s = blank();
    const big = TILES.filter((t) => 'ABCD'.includes(t[0])).slice(0, 41);
    setBoard(s, { ft: big, cw: ['I1', 'I2'] });
    s.phase = 'buy';
    s.players[0].shares.ft = 3;
    s.players[1].shares.ft = 1;
    s.players[2].shares.cw = 2;
    expect(canClose(s)).toBe(true);
    const t = applyAction(s, 0, { type: 'close', cart: {} });
    expect(t.phase).toBe('over');
    // ft 41 → $1200: Ada 12000 + 3×1200; Bo 6000 + 1200; Cy sole cw $200 → 3000 + 2×200
    expect(t.players[0].cash).toBe(6000 + 12000 + 3600);
    expect(t.players[1].cash).toBe(6000 + 6000 + 1200);
    expect(t.players[2].cash).toBe(6000 + 3000 + 400);
    expect(t.results[0]).toMatchObject({ seat: 0, rank: 1 });
    expect(t.fx.kind).toBe('bell');
  });

  test('the bell may ring when every active company is a trust', () => {
    const s = blank();
    setBoard(s, { cr: TILES.slice(0, 11) });
    s.phase = 'buy';
    expect(canClose(s)).toBe(true);
    setBoard(s, { cw: ['I1', 'I2'] });
    expect(canClose(s)).toBe(false);
    expect(applyAction(s, 0, { type: 'close' })).toBeNull();
  });

  test('the game ends when the pool is empty and nobody can build', () => {
    const s = blank();
    setBoard(s, { cr: TILES.filter((t) => t[0] === 'A' || t === 'B1'), ft: TILES.filter((t) => t[0] === 'C') });
    s.pool = [];
    s.players.forEach((p) => { p.hand = []; });
    give(s, 1, ['B5']); // dead deed
    s.phase = 'buy';
    const t = applyAction(s, 0, { type: 'buy', cart: {} });
    expect(t.phase).toBe('over');
    expect(t.reason).toMatch(/No buildable deeds/);
  });

  test('a tycoon with no legal deed skips to buying', () => {
    const s = blank();
    const rows = 'ABCDEFGHI';
    COMPANY_IDS.forEach((co, i) => setBoard(s, { [co]: [rows[i] + '11', rows[i] + '12'] }));
    setBoard(s, { x: ['A1'] });
    give(s, 1, ['A2']);
    s.phase = 'buy';
    const t = applyAction(s, 0, { type: 'buy', cart: {} });
    expect(t.turn).toBe(1);
    expect(t.phase).toBe('buy');
  });
});

describe('bots', () => {
  function play(n, seed, { neverRing = false } = {}) {
    const players = Array.from({ length: n }, (_, i) => ({ id: 'b' + i, name: 'B' + i, bot: true }));
    let s = newGame(players, { seed });
    let steps = 0;
    while (s.phase !== 'over') {
      let a = botAction(s);
      if (neverRing && a.type === 'close') a = { type: 'buy', cart: {} };
      const next = applyAction(s, actorOf(s), a);
      expect(next).not.toBeNull();
      s = next;
      steps += 1;
      if (steps > 5000) throw new Error('did not terminate');
    }
    return s;
  }

  test('bots-only games terminate for 2–6 tycoons', () => {
    for (let n = 2; n <= 6; n++) {
      for (let seed = 1; seed <= 12; seed++) {
        const s = play(n, seed * 31 + n);
        expect(s.results).toHaveLength(n);
        const shares = s.players.reduce((a, p) => a + Object.values(p.shares).reduce((x, y) => x + y, 0), 0);
        expect(shares).toBe(0);
        expect(Object.values(s.bank).every((b) => b === 25)).toBe(true);
      }
    }
  });

  test('games end on their own when nobody rings the bell', () => {
    for (let seed = 1; seed <= 10; seed++) {
      const s = play(2 + (seed % 5), seed, { neverRing: true });
      expect(s.phase).toBe('over');
    }
  });
});

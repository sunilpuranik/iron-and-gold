// Pure rule helpers shared by the engine and the bots.
import {
  COMPANY_IDS, END_SIZE, TRUST_SIZE, company, neighbours,
} from './data.js';

export const LOOSE = 'x';

export function sizes(state) {
  const out = {};
  for (const id of COMPANY_IDS) out[id] = 0;
  for (const v of Object.values(state.board)) if (v !== LOOSE) out[v] += 1;
  return out;
}

export function sizeOf(state, co) {
  return sizes(state)[co];
}

export function bracket(size) {
  if (size < 2) return -1;
  if (size <= 5) return size - 2;
  if (size <= 10) return 4;
  if (size <= 20) return 5;
  if (size <= 30) return 6;
  if (size <= 40) return 7;
  return 8;
}

// Share price in dollars for a company of a given size. 0 when not on the board.
export function price(co, size) {
  const k = bracket(size);
  if (k < 0) return 0;
  return (2 + k + company(co).tier) * 100;
}

export function priceOf(state, co) {
  return price(co, sizeOf(state, co));
}

export function isTrust(size) {
  return size >= TRUST_SIZE;
}

export function activeCompanies(state) {
  const sz = sizes(state);
  return COMPANY_IDS.filter((c) => sz[c] >= 2);
}

// What placing `tile` would do right now.
// kinds: survey | found | grow | buyout | dead | blocked
export function classify(state, tile) {
  const ns = neighbours(tile).filter((n) => state.board[n]);
  if (ns.length === 0) return { kind: 'survey' };
  const cos = [...new Set(ns.map((n) => state.board[n]).filter((v) => v !== LOOSE))];
  const sz = sizes(state);
  if (cos.length === 0) {
    const free = COMPANY_IDS.filter((c) => sz[c] === 0);
    return free.length ? { kind: 'found', free } : { kind: 'blocked' };
  }
  if (cos.length === 1) return { kind: 'grow', company: cos[0] };
  cos.sort((a, b) => sz[b] - sz[a] || COMPANY_IDS.indexOf(a) - COMPANY_IDS.indexOf(b));
  if (cos.filter((c) => isTrust(sz[c])).length >= 2) return { kind: 'dead', companies: cos };
  const top = sz[cos[0]];
  return { kind: 'buyout', companies: cos, tied: cos.filter((c) => sz[c] === top) };
}

export function isLegal(state, tile) {
  const k = classify(state, tile).kind;
  return k !== 'dead' && k !== 'blocked';
}

// Tiles reachable from `start` through loose plots or plots owned by `absorb` companies.
export function floodFrom(state, start, absorb = []) {
  const seen = new Set([start]);
  const stack = [start];
  while (stack.length) {
    const t = stack.pop();
    for (const n of neighbours(t)) {
      if (seen.has(n)) continue;
      const v = state.board[n];
      if (v === LOOSE || (v && absorb.includes(v))) {
        seen.add(n);
        stack.push(n);
      }
    }
  }
  return [...seen];
}

// Size a company would have after `tile` joins it (absorbing loose plots and `absorb` companies).
export function sizeAfter(state, tile, co, absorb = []) {
  const joined = floodFrom(state, tile, absorb).filter((t) => state.board[t] !== co).length;
  return sizeOf(state, co) + joined;
}

export function canClose(state) {
  const sz = sizes(state);
  const active = COMPANY_IDS.filter((c) => sz[c] >= 2);
  if (!active.length) return false;
  return active.some((c) => sz[c] >= END_SIZE) || active.every((c) => isTrust(sz[c]));
}

export function actorOf(state) {
  if (state.phase === 'dispose') return state.pending.queue[0].seat;
  return state.turn;
}

export function netWorth(state, seat) {
  const p = state.players[seat];
  const sz = sizes(state);
  let v = p.cash;
  for (const c of COMPANY_IDS) v += p.shares[c] * price(c, sz[c]);
  return v;
}

// Majority / minority bonuses for one company at a given share price.
// Returns [{ seat, amount, kind }].
export function bonusesFor(state, co, sharePrice) {
  const holders = state.players
    .map((p, seat) => ({ seat, n: p.shares[co] }))
    .filter((h) => h.n > 0)
    .sort((a, b) => b.n - a.n || a.seat - b.seat);
  if (!holders.length || !sharePrice) return [];
  const maj = sharePrice * 10;
  const min = sharePrice * 5;
  const up = (x) => Math.ceil(x / 100) * 100;
  if (holders.length === 1) return [{ seat: holders[0].seat, amount: maj + min, kind: 'sole' }];
  const top = holders.filter((h) => h.n === holders[0].n);
  if (top.length > 1) {
    const each = up((maj + min) / top.length);
    return top.map((h) => ({ seat: h.seat, amount: each, kind: 'tied majority' }));
  }
  const rest = holders.slice(1);
  const second = rest.filter((h) => h.n === rest[0].n);
  const each = up(min / second.length);
  return [
    { seat: holders[0].seat, amount: maj, kind: 'majority' },
    ...second.map((h) => ({ seat: h.seat, amount: each, kind: second.length > 1 ? 'tied minority' : 'minority' })),
  ];
}

// Short human description of what a deed would do, e.g. "Grows P&W → 7".
export function effectOf(state, tile) {
  const c = classify(state, tile);
  const short = (id) => company(id).short;
  switch (c.kind) {
    case 'survey':
      return 'Surveyed plot';
    case 'found':
      return 'Charters a company';
    case 'grow':
      return `Grows ${short(c.company)} → ${sizeAfter(state, tile, c.company)}`;
    case 'buyout': {
      if (c.tied.length > 1) return `Buyout: ${c.tied.map(short).join(' vs ')} (tie)`;
      const [surv, ...rest] = c.companies;
      return `Buyout: ${short(surv)} absorbs ${rest.map(short).join(', ')}`;
    }
    case 'dead':
      return 'Dead — would join two trusts';
    default:
      return 'Held — all 7 companies active';
  }
}

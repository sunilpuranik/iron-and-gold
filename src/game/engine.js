// Iron & Gold game engine. Pure functions over plain JSON state — no React.
import {
  COMPANY_IDS, HAND_SIZE, MAX_BUY, SHARES_PER_COMPANY, START_CASH, TILES, company,
} from './data.js';
import {
  LOOSE, actorOf, bonusesFor, canClose, classify, floodFrom, isLegal, price, sizes,
} from './rules.js';

export * from './rules.js';
export { botAction } from './bot.js';

const LOG_LIMIT = 120;
const RECAP_LIMIT = 40;

export function mulberry32(seed) {
  let a = seed >>> 0;
  return function rand() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle(list, rand) {
  const a = list.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function zeros(n) {
  const o = {};
  for (const id of COMPANY_IDS) o[id] = n;
  return o;
}

const money = (n) => '$' + n.toLocaleString('en-US');
const nameOf = (s, seat) => s.players[seat].name;
const short = (co) => company(co).short;

function log(s, text, kind = 'info') {
  s.log.push({ seq: s.seq, turn: s.turnNo, text, kind });
  if (s.log.length > LOG_LIMIT) s.log.splice(0, s.log.length - LOG_LIMIT);
}

// `detail` carries what the app needs to animate and summarise the moment.
function fx(s, kind, tile, id = null, detail = null) {
  s.fx = {
    kind, id, tile, seq: s.seq, detail,
  };
}

// players: [{ id, name, avatar, bot }]; opts: { seed }
export function newGame(players, opts = {}) {
  if (players.length < 2 || players.length > 6) throw new Error('Iron & Gold needs 2–6 tycoons');
  const rand = opts.seed != null ? mulberry32(opts.seed) : Math.random;
  const seated = shuffle(players, rand);
  const pool = shuffle(TILES, rand);
  const s = {
    v: 1,
    players: seated.map((p) => ({
      id: p.id, name: p.name, avatar: p.avatar ?? 0, bot: !!p.bot,
      cash: START_CASH, hand: [], shares: zeros(0),
    })),
    board: {},
    pool,
    bank: zeros(SHARES_PER_COMPANY),
    turn: 0,
    turnNo: 1,
    phase: 'place',
    pending: null,
    last: null,
    idle: 0,
    log: [],
    turns: [],
    fx: null,
    seq: 0,
    results: null,
  };
  for (const p of s.players) {
    const t = s.pool.pop();
    s.board[t] = LOOSE;
    log(s, `${p.name} surveys ${t}`);
  }
  for (const p of s.players) while (p.hand.length < HAND_SIZE) p.hand.push(s.pool.pop());
  log(s, `The town charter is signed. ${s.players[0].name} builds first.`, 'turn');
  startTurn(s);
  return s;
}

function anyoneCanPlay(s) {
  return s.players.some((p) => p.hand.some((t) => isLegal(s, t)));
}

function startTurn(s) {
  if (!s.pool.length && !anyoneCanPlay(s)) {
    endGame(s, 'No buildable deeds remain');
    return;
  }
  const p = s.players[s.turn];
  // Retire dead deeds (would join two trusts) and draw replacements.
  for (;;) {
    const dead = p.hand.filter((t) => classify(s, t).kind === 'dead');
    if (!dead.length) break;
    p.hand = p.hand.filter((t) => !dead.includes(t));
    log(s, `${p.name} retires dead deed${dead.length > 1 ? 's' : ''} ${dead.join(', ')}`);
    if (!s.pool.length) break;
    while (p.hand.length < HAND_SIZE && s.pool.length) p.hand.push(s.pool.pop());
  }
  s.pending = null;
  if (p.hand.some((t) => isLegal(s, t))) {
    s.phase = 'place';
    return;
  }
  s.idle += 1;
  if (s.idle > s.players.length) {
    endGame(s, 'A full round passed with nothing built');
    return;
  }
  log(s, `${p.name} has no buildable deed`);
  s.phase = 'buy';
}

// Remember what happened on the turn that just finished, for turn dispatches.
function recordTurn(s) {
  const lines = s.log.filter((l) => l.turn === s.turnNo && l.kind !== 'turn');
  if (!s.turns) s.turns = [];
  s.turns.push({
    turn: s.turnNo,
    seat: s.turn,
    lines: lines.map((l) => ({ text: l.text, kind: l.kind })),
  });
  if (s.turns.length > RECAP_LIMIT) s.turns.splice(0, s.turns.length - RECAP_LIMIT);
}

function endTurn(s) {
  recordTurn(s);
  const p = s.players[s.turn];
  while (p.hand.length < HAND_SIZE && s.pool.length) p.hand.push(s.pool.pop());
  s.turn = (s.turn + 1) % s.players.length;
  s.turnNo += 1;
  startTurn(s);
}

function toBuy(s) {
  s.phase = 'buy';
  s.pending = null;
}

function payBonuses(s, co, sharePrice, label) {
  const paid = bonusesFor(s, co, sharePrice);
  for (const b of paid) {
    s.players[b.seat].cash += b.amount;
    log(s, `${nameOf(s, b.seat)} takes ${money(b.amount)} ${b.kind} bonus in ${short(co)}${label ? ' ' + label : ''}`, 'money');
  }
  return paid.map((b) => ({ ...b, co }));
}

function claim(s, tile, co, absorb = []) {
  for (const t of floodFrom(s, tile, absorb)) s.board[t] = co;
}

function found(s, co) {
  const { tile } = s.pending;
  claim(s, tile, co);
  const p = s.players[s.turn];
  if (s.bank[co] > 0) {
    s.bank[co] -= 1;
    p.shares[co] += 1;
  }
  const size = sizes(s)[co];
  log(s, `${p.name} charters ${company(co).name} at ${tile} (${size} plots)`, 'found');
  fx(s, 'found', tile, co, {
    seat: s.turn, size, price: price(co, size), founderShare: p.shares[co] > 0,
  });
  toBuy(s);
}

function beginBuyout(s, survivor, tile, companies) {
  const sz = sizes(s);
  const absorbed = companies
    .filter((c) => c !== survivor)
    .sort((a, b) => sz[b] - sz[a] || COMPANY_IDS.indexOf(a) - COMPANY_IDS.indexOf(b))
    .map((co) => ({ co, size: sz[co], price: price(co, sz[co]) }));
  log(s, `Buyout! ${company(survivor).name} absorbs ${absorbed.map((a) => short(a.co)).join(', ')} at ${tile}`, 'buyout');
  const bonuses = [];
  for (const a of absorbed) bonuses.push(...payBonuses(s, a.co, a.price));
  const before = sz[survivor];
  claim(s, tile, survivor, absorbed.map((a) => a.co));
  const after = sizes(s)[survivor];
  const n = s.players.length;
  const queue = [];
  for (const a of absorbed) {
    for (let i = 0; i < n; i++) {
      const seat = (s.turn + i) % n;
      if (s.players[seat].shares[a.co] > 0) queue.push({ co: a.co, seat });
    }
  }
  fx(s, 'buyout', tile, survivor, {
    seat: s.turn,
    absorbed,
    bonuses,
    before,
    after,
    price: price(survivor, after),
    trust: after >= 11 && before < 11,
    holders: queue.length,
  });
  if (!queue.length) {
    toBuy(s);
    return;
  }
  s.phase = 'dispose';
  s.pending = { survivor, absorbed, queue, tile };
}

const isCount = (n) => Number.isInteger(n) && n >= 0;

function validCart(s, seat, cart) {
  if (!cart || typeof cart !== 'object') return null;
  const sz = sizes(s);
  let total = 0;
  let cost = 0;
  const clean = {};
  for (const [co, n] of Object.entries(cart)) {
    if (!COMPANY_IDS.includes(co) || !isCount(n)) return null;
    if (!n) continue;
    if (sz[co] < 2 || s.bank[co] < n) return null;
    total += n;
    cost += n * price(co, sz[co]);
    clean[co] = n;
  }
  if (total > MAX_BUY || cost > s.players[seat].cash) return null;
  return { clean, cost, sz };
}

function applyCart(s, seat, v) {
  const p = s.players[seat];
  const bits = [];
  for (const [co, n] of Object.entries(v.clean)) {
    p.shares[co] += n;
    s.bank[co] -= n;
    bits.push(`${n} ${short(co)}`);
  }
  p.cash -= v.cost;
  if (bits.length) log(s, `${p.name} buys ${bits.join(', ')} for ${money(v.cost)}`, 'money');
}

export function endGame(s, reason) {
  if (s.phase === 'buy') recordTurn(s);
  const sz = sizes(s);
  log(s, `Closing bell — ${reason}`, 'bell');
  for (const co of COMPANY_IDS) if (sz[co] >= 2) payBonuses(s, co, price(co, sz[co]), '(final)');
  for (const p of s.players) {
    for (const co of COMPANY_IDS) {
      if (sz[co] >= 2) p.cash += p.shares[co] * price(co, sz[co]);
      s.bank[co] += p.shares[co];
      p.shares[co] = 0;
    }
  }
  const order = s.players.map((p, seat) => ({ seat, cash: p.cash })).sort((a, b) => b.cash - a.cash);
  s.results = order.map((r) => ({ ...r, rank: order.findIndex((o) => o.cash === r.cash) + 1 }));
  s.phase = 'over';
  s.pending = null;
  s.reason = reason;
  fx(s, 'bell', null);
  const winners = s.results.filter((r) => r.rank === 1).map((r) => nameOf(s, r.seat));
  log(s, `${winners.join(' & ')} win${winners.length > 1 ? '' : 's'} with ${money(s.results[0].cash)}`, 'bell');
}

// Apply `action` for `seat`. Returns a new state, or null if the action is not legal.
export function applyAction(state, seat, action) {
  if (!state || !action || state.phase === 'over') return null;
  if (seat !== actorOf(state)) return null;
  const s = JSON.parse(JSON.stringify(state));
  s.seq += 1;
  const p = s.players[seat];

  switch (action.type) {
    case 'place': {
      if (s.phase !== 'place' || !p.hand.includes(action.tile)) return null;
      const tile = action.tile;
      const c = classify(s, tile);
      if (c.kind === 'dead' || c.kind === 'blocked') return null;
      p.hand = p.hand.filter((t) => t !== tile);
      s.last = tile;
      s.idle = 0;
      if (c.kind === 'survey') {
        s.board[tile] = LOOSE;
        log(s, `${p.name} surveys ${tile}`);
        fx(s, 'survey', tile);
        toBuy(s);
      } else if (c.kind === 'found') {
        s.board[tile] = LOOSE;
        log(s, `${p.name} builds on ${tile}`);
        s.phase = 'found';
        s.pending = { tile };
      } else if (c.kind === 'grow') {
        claim(s, tile, c.company);
        log(s, `${p.name} builds on ${tile} — ${short(c.company)} grows to ${sizes(s)[c.company]}`);
        fx(s, 'build', tile, c.company);
        toBuy(s);
      } else {
        s.board[tile] = LOOSE;
        if (c.tied.length > 1) {
          log(s, `${p.name} builds on ${tile} — a tied buyout between ${c.tied.map(short).join(' & ')}`);
          s.phase = 'survivor';
          s.pending = { tile, companies: c.companies, tied: c.tied };
        } else {
          beginBuyout(s, c.companies[0], tile, c.companies);
        }
      }
      return s;
    }

    case 'found': {
      if (s.phase !== 'found') return null;
      if (!COMPANY_IDS.includes(action.company) || sizes(s)[action.company] !== 0) return null;
      found(s, action.company);
      return s;
    }

    case 'survivor': {
      if (s.phase !== 'survivor' || !s.pending.tied.includes(action.company)) return null;
      log(s, `${p.name} names ${short(action.company)} the survivor`);
      beginBuyout(s, action.company, s.pending.tile, s.pending.companies);
      return s;
    }

    case 'dispose': {
      if (s.phase !== 'dispose') return null;
      const sell = action.sell ?? 0;
      const trade = action.trade ?? 0;
      const { co } = s.pending.queue[0];
      const surv = s.pending.survivor;
      const held = p.shares[co];
      if (!isCount(sell) || !isCount(trade) || trade % 2) return null;
      if (sell + trade > held || trade / 2 > s.bank[surv]) return null;
      const info = s.pending.absorbed.find((a) => a.co === co);
      p.cash += sell * info.price;
      p.shares[co] -= sell + trade;
      s.bank[co] += sell + trade;
      p.shares[surv] += trade / 2;
      s.bank[surv] -= trade / 2;
      const hold = held - sell - trade;
      const bits = [];
      if (sell) bits.push(`sells ${sell} for ${money(sell * info.price)}`);
      if (trade) bits.push(`swaps ${trade} for ${trade / 2} ${short(surv)}`);
      if (hold) bits.push(`holds ${hold}`);
      log(s, `${p.name} ${bits.join(', ')} of ${short(co)}`, 'money');
      s.pending.queue.shift();
      if (!s.pending.queue.length) toBuy(s);
      return s;
    }

    case 'buy': {
      if (s.phase !== 'buy') return null;
      const v = validCart(s, seat, action.cart || {});
      if (!v) return null;
      applyCart(s, seat, v);
      endTurn(s);
      return s;
    }

    case 'close': {
      if (s.phase !== 'buy' || !canClose(s)) return null;
      const v = validCart(s, seat, action.cart || {});
      if (!v) return null;
      applyCart(s, seat, v);
      endGame(s, `${p.name} rings the closing bell`);
      return s;
    }

    default:
      return null;
  }
}

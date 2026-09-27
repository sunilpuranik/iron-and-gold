// Simple bots. botAction(state) returns an action for whoever must act now.
import { COMPANY_IDS, MAX_BUY, company } from './data.js';
import {
  actorOf, canClose, classify, isLegal, netWorth, price, sizes,
} from './rules.js';

function scoreDeed(state, tile, me) {
  const c = classify(state, tile);
  const owns = (co) => me.shares[co] > 0;
  switch (c.kind) {
    case 'found':
      return 100;
    case 'buyout': {
      const held = c.companies.reduce((n, co) => n + me.shares[co], 0);
      return held ? 80 + held : 40;
    }
    case 'grow':
      return owns(c.company) ? 60 + me.shares[c.company] : 20;
    case 'survey':
      return 10;
    default:
      return -1;
  }
}

function chooseCart(state, seat) {
  const me = state.players[seat];
  const sz = sizes(state);
  const cart = {};
  let cash = me.cash;
  for (let i = 0; i < MAX_BUY; i++) {
    const options = COMPANY_IDS.filter((co) => {
      if (sz[co] < 2) return false;
      if (state.bank[co] - (cart[co] || 0) <= 0) return false;
      return price(co, sz[co]) <= cash;
    });
    if (!options.length) break;
    options.sort((a, b) => {
      const held = (co) => me.shares[co] + (cart[co] || 0);
      return held(b) - held(a) || price(a, sz[a]) - price(b, sz[b]);
    });
    const pick = options[0];
    cart[pick] = (cart[pick] || 0) + 1;
    cash -= price(pick, sz[pick]);
  }
  return cart;
}

function isLeading(state, seat) {
  const mine = netWorth(state, seat);
  return state.players.every((_, i) => i === seat || netWorth(state, i) < mine);
}

export function botAction(state) {
  if (!state || state.phase === 'over') return null;
  const seat = actorOf(state);
  const me = state.players[seat];
  switch (state.phase) {
    case 'place': {
      let best = null;
      let bestScore = -1;
      for (const t of me.hand) {
        if (!isLegal(state, t)) continue;
        const sc = scoreDeed(state, t, me);
        if (sc > bestScore) {
          best = t;
          bestScore = sc;
        }
      }
      return best ? { type: 'place', tile: best } : null;
    }
    case 'found': {
      const sz = sizes(state);
      const free = COMPANY_IDS.filter((co) => sz[co] === 0);
      free.sort((a, b) => company(b).tier - company(a).tier);
      return { type: 'found', company: free[0] };
    }
    case 'survivor': {
      const tied = state.pending.tied.slice().sort((a, b) => me.shares[b] - me.shares[a]);
      return { type: 'survivor', company: tied[0] };
    }
    case 'dispose': {
      const { co } = state.pending.queue[0];
      const held = me.shares[co];
      const trade = Math.min(Math.floor(held / 2) * 2, state.bank[state.pending.survivor] * 2);
      return { type: 'dispose', sell: held - trade, trade };
    }
    case 'buy': {
      if (canClose(state) && isLeading(state, seat)) return { type: 'close', cart: {} };
      return { type: 'buy', cart: chooseCart(state, seat) };
    }
    default:
      return null;
  }
}

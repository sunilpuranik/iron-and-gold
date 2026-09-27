// Plays bots-only games to confirm the engine always terminates.
// Usage: node scripts/simulate.mjs [games=200] [players=4]
import { actorOf, applyAction, botAction, newGame } from '../src/game/engine.js';

const games = Number(process.argv[2] || 200);
const seats = Number(process.argv[3] || 4);
const MAX_STEPS = 5000;

let totalTurns = 0;
const reasons = {};
for (let g = 0; g < games; g++) {
  const n = seats === 0 ? 2 + (g % 5) : seats;
  const players = Array.from({ length: n }, (_, i) => ({ id: 'b' + i, name: 'Bot ' + (i + 1), bot: true }));
  let s = newGame(players, { seed: g + 1 });
  let steps = 0;
  while (s.phase !== 'over') {
    const action = botAction(s);
    const next = applyAction(s, actorOf(s), action);
    if (!next) throw new Error(`Game ${g}: bot produced illegal action ${JSON.stringify(action)} in phase ${s.phase}`);
    s = next;
    if (++steps > MAX_STEPS) throw new Error(`Game ${g} did not terminate`);
  }
  totalTurns += s.turnNo;
  const key = s.reason.replace(/^.* rings/, 'someone rings');
  reasons[key] = (reasons[key] || 0) + 1;
  if (g === 0) {
    console.log('Sample game — last 12 ticker lines:');
    for (const l of s.log.slice(-12)) console.log('  ' + l.text);
    console.log('');
  }
}
console.log(`${games} bots-only games finished. Average ${Math.round(totalTurns / games)} turns.`);
for (const [r, n] of Object.entries(reasons)) console.log(`  ${n} × ${r}`);

// Shared preview fixtures (not a component preview): real game states dealt by the app's own
// engine, and a lacquer backdrop so components sit on the ground they were designed for.
import * as React from 'react';
import {
  RN, actorOf, applyAction, botAction, newGame, useTheme,
} from 'iron-and-gold';

const { View } = RN;

export const TYCOONS = [
  { id: 'p1', name: 'Eleanor Vance', avatar: 5 },
  { id: 'p2', name: 'Col. Barlow', avatar: 0, bot: true },
  { id: 'p3', name: 'Widow Pike', avatar: 2, bot: true },
  { id: 'p4', name: 'Judge Harlan', avatar: 3, bot: true },
];

// Play bot turns from a seeded deal until `until(state)` holds or `max` actions pass.
export function play({ seed = 7, max = 400, until = () => false } = {}) {
  let s = newGame(TYCOONS, { seed });
  for (let i = 0; i < max && s.phase !== 'over' && !until(s); i++) {
    const next = applyAction(s, actorOf(s), botAction(s));
    if (!next) break;
    s = next;
  }
  return s;
}

const cache = {};
// A mid-game state (several companies chartered, shares held), memoised per key.
export function midGame(steps = 90, seed = 7) {
  const k = `m${steps}-${seed}`;
  return cache[k] || (cache[k] = play({ seed, max: steps }));
}
// The first state in a given phase ('found', 'buy', 'survivor', 'dispose', 'over').
export function inPhase(phase, seed = 7) {
  const k = `p${phase}-${seed}`;
  return cache[k] || (cache[k] = play({ seed, max: 5000, until: (s) => s.phase === phase }));
}
export function finished(seed = 7) {
  const k = `over-${seed}`;
  return cache[k] || (cache[k] = play({ seed, max: 5000 }));
}

export function Paper({ children, pad = 16, width, style }: any) {
  const th = useTheme();
  return <View style={[{ backgroundColor: th.ground, padding: pad, gap: 12, width }, style]}>{children}</View>;
}

// Animated (react-native-web) measures elapsed time with Date.now(). The capture harness freezes
// Date for deterministic screenshots, which parks entrance animations at frame 0. Re-base Date.now
// on performance.now (identical to a real clock in the product) for previews that animate in.
export function liveClock() {
  const d0 = Date.now();
  const p0 = performance.now();
  Date.now = () => d0 + (performance.now() - p0);
}

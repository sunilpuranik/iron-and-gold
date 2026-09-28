import * as React from 'react';
import { SettleSheet, actorOf } from 'iron-and-gold';
import { inPhase } from './_kit';

export const SellSwapHold = () => {
  const s = inPhase('dispose', 11);
  return <SettleSheet visible state={s} me={s.players[actorOf(s)]} onSettle={() => {}} onClose={() => {}} />;
};

import * as React from 'react';
import { SurvivorSheet, actorOf } from 'iron-and-gold';
import { inPhase } from './_kit';

export const TiedBuyout = () => {
  const s = inPhase('survivor');
  return <SurvivorSheet visible state={s} me={s.players[actorOf(s)]} onPick={() => {}} onClose={() => {}} />;
};

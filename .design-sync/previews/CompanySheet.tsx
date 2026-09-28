import * as React from 'react';
import { CompanySheet, actorOf } from 'iron-and-gold';
import { inPhase, play } from './_kit';

export const Charter = () => {
  const s = play({ seed: 7, max: 400, until: (x) => x.phase === 'found' && x.turnNo > 6 });
  return <CompanySheet mode="charter" visible state={s} onPick={() => {}} onClose={() => {}} />;
};

export const TiedBuyout = () => {
  const s = inPhase('survivor');
  return <CompanySheet mode="survivor" visible state={s} me={s.players[actorOf(s)]} onPick={() => {}} onClose={() => {}} />;
};

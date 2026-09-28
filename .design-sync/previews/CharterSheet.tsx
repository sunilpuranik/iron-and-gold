import * as React from 'react';
import { CharterSheet } from 'iron-and-gold';
import { play } from './_kit';

export const PickACompany = () => {
  const s = play({ seed: 7, max: 400, until: (x) => x.phase === 'found' && x.turnNo > 6 });
  return <CharterSheet visible state={s} onPick={() => {}} onClose={() => {}} />;
};

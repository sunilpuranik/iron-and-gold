import * as React from 'react';
import { HandoffCover, turnsSince } from 'iron-and-gold';
import { midGame } from './_kit';

export const PassTheTelegraph = () => {
  const s = midGame();
  return <HandoffCover player={s.players[0]} recap={turnsSince(s, 0, 3)} onReady={() => {}} />;
};

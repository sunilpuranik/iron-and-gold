import * as React from 'react';
import { InvestSheet, actorOf } from 'iron-and-gold';
import { midGame } from './_kit';

export const BuyShares = () => {
  const s = midGame();
  return <InvestSheet visible state={s} me={s.players[actorOf(s)]} onBuy={() => {}} onClose={() => {}} />;
};

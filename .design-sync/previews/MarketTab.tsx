import * as React from 'react';
import { MarketTab } from 'iron-and-gold';
import { Paper, midGame } from './_kit';

export const Companies = () => {
  const s = midGame();
  return (
    <Paper width={390} pad={0}>
      <MarketTab state={s} me={s.players[0]} onCertificate={() => {}} />
    </Paper>
  );
};

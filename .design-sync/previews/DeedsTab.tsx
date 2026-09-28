import * as React from 'react';
import { DeedsTab } from 'iron-and-gold';
import { Paper, midGame } from './_kit';

export const Hand = () => {
  const s = midGame();
  const [sel, setSel] = React.useState(s.players[0].hand[1]);
  return (
    <Paper width={390} pad={0}>
      <DeedsTab state={s} hand={s.players[0].hand} selected={sel} canBuild onDeed={setSel} />
    </Paper>
  );
};

export const NotYourTurn = () => {
  const s = midGame();
  return (
    <Paper width={390} pad={0}>
      <DeedsTab state={s} hand={s.players[0].hand} canBuild={false} />
    </Paper>
  );
};

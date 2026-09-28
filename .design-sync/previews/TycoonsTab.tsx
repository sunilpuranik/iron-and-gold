import * as React from 'react';
import { TycoonsTab } from 'iron-and-gold';
import { Paper, midGame } from './_kit';

export const Standings = () => (
  <Paper width={390} pad={0}>
    <TycoonsTab state={midGame()} mySeat={0} />
  </Paper>
);

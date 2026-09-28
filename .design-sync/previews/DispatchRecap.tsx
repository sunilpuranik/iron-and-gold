import * as React from 'react';
import { DispatchRecap, turnsSince } from 'iron-and-gold';
import { Paper, midGame } from './_kit';

export const SinceYourLastTurn = () => (
  <Paper width={380}>
    <DispatchRecap dispatches={turnsSince(midGame(), 0)} />
  </Paper>
);

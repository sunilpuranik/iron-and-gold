import * as React from 'react';
import { Certificate } from 'iron-and-gold';
import { Paper, midGame } from './_kit';

export const Registered = () => (
  <Paper width={380}>
    <Certificate id="pw" state={midGame()} owner="Eleanor Vance" shares={4} number={301} />
  </Paper>
);

export const Specimen = () => (
  <Paper width={380}>
    <Certificate id="ae" state={midGame()} owner="" shares={0} number={501} />
  </Paper>
);

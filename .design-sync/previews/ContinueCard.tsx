import * as React from 'react';
import { ContinueCard } from 'iron-and-gold';
import { Paper, midGame } from './_kit';

export const MidGame = () => (
  <Paper pad={24} width={520}>
    <ContinueCard saved={midGame()} myId="p1" onPress={() => {}} />
  </Paper>
);

export const EarlyCompact = () => (
  <Paper pad={16} width={360}>
    <ContinueCard saved={midGame(24)} myId="p1" compact onPress={() => {}} />
  </Paper>
);

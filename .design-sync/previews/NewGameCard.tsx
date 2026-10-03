import * as React from 'react';
import { NewGameCard } from 'iron-and-gold';
import { Paper } from './_kit';

export const Wide = () => (
  <Paper pad={24} width={520}>
    <NewGameCard width={472} onPress={() => {}} />
  </Paper>
);

export const Compact = () => (
  <Paper pad={16} width={360}>
    <NewGameCard width={328} compact onPress={() => {}} />
  </Paper>
);

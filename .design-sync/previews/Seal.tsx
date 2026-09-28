import * as React from 'react';
import { RN, Seal } from 'iron-and-gold';
import { Paper } from './_kit';

const { View } = RN;

export const Initials = () => (
  <Paper width={320}>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
      <Seal label="PWR" />
      <Seal label="RMO" size={80} />
      <Seal label="FTB" size={40} />
    </View>
  </Paper>
);

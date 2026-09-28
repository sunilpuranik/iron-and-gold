import * as React from 'react';
import { Emblem, RN } from 'iron-and-gold';
import { Paper } from './_kit';

const { View } = RN;

export const Sizes = () => (
  <Paper width={360}>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 18 }}>
      <Emblem size={40} />
      <Emblem size={88} />
      <Emblem size={160} />
    </View>
  </Paper>
);

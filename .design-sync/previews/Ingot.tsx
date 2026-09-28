import * as React from 'react';
import { Ingot, RN } from 'iron-and-gold';
import { Paper } from './_kit';

const { View } = RN;

export const Sizes = () => (
  <Paper width={320}>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
      <Ingot amount={6000} size={14} />
      <Ingot amount={24380} size={16} />
      <Ingot amount={51200} size={22} />
    </View>
  </Paper>
);

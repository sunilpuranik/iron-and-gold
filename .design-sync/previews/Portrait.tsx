import * as React from 'react';
import {
  Portrait, RN, T, TYCOON_TITLES,
} from 'iron-and-gold';
import { Paper } from './_kit';

const { View } = RN;

export const AllTycoons = () => (
  <Paper width={420}>
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 14 }}>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <View key={i} style={{ alignItems: 'center', gap: 6, width: 110 }}>
          <Portrait index={i} size={72} />
          <T v="small">{TYCOON_TITLES[i]}</T>
        </View>
      ))}
    </View>
  </Paper>
);

export const States = () => (
  <Paper width={340}>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
      <Portrait index={3} size={32} />
      <Portrait index={0} size={42} bot />
      <Portrait index={5} size={42} ring />
      <Portrait index={2} size={112} ring bot />
    </View>
  </Paper>
);

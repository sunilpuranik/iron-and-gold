import * as React from 'react';
import { Avatar, RN, T, TYCOON_TITLES } from 'iron-and-gold';
import { Paper } from './_kit';

const { View } = RN;

export const AllTycoons = () => (
  <Paper width={420}>
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 14 }}>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <View key={i} style={{ alignItems: 'center', gap: 4, width: 110 }}>
          <Avatar index={i} size={56} />
          <T v="small">{TYCOON_TITLES[i]}</T>
        </View>
      ))}
    </View>
  </Paper>
);

export const States = () => (
  <Paper width={320}>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
      <Avatar index={3} size={40} />
      <Avatar index={0} size={40} bot />
      <Avatar index={5} size={40} ring />
      <Avatar index={2} size={72} ring bot />
    </View>
  </Paper>
);

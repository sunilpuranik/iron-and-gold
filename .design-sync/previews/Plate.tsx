import * as React from 'react';
import {
  Money, Plate, RN, Rule, T, useTheme,
} from 'iron-and-gold';
import { Paper } from './_kit';

const { View } = RN;
const row = { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' };

export const YourPosition = () => {
  const th = useTheme();
  return (
    <Paper width={360}>
      <Plate pad={20} style={{ gap: 8 }}>
        <T v="title">Your position</T>
        <T v="accent" color={th.inkSoft} style={{ fontSize: 15 }}>Net worth at today's prices</T>
        <Rule kind="gilt" style={{ marginVertical: 6 }} />
        <View style={row}><T>Cash on hand</T><Money amount={4200} size={16} /></View>
        <View style={row}><T>Shares held</T><Money amount={3850} size={16} /></View>
      </Plate>
    </Paper>
  );
};

export const Materials = () => (
  <Paper width={420}>
    <View style={{ flexDirection: 'row', gap: 10 }}>
      {['lacquer', 'iron', 'gold', 'bond'].map((m) => (
        <View key={m} style={{ flex: 1, gap: 6, alignItems: 'center' }}>
          <Plate material={m as any} rivets={m === 'iron'} style={{ alignSelf: 'stretch', height: 64 }} />
          <T v="label">{m}</T>
        </View>
      ))}
    </View>
  </Paper>
);

import * as React from 'react';
import { Money, RN, T } from 'iron-and-gold';
import { Paper } from './_kit';

const { View } = RN;
const row = { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' };

export const Sizes = () => (
  <Paper width={320}>
    {['ingot', 'title', 'body', 'small'].map((v) => (
      <View key={v} style={row}>
        <T v="small">{v}</T>
        <Money amount={14250} v={v as any} />
      </View>
    ))}
  </Paper>
);

export const Deltas = () => (
  <Paper width={320}>
    <View style={{ flexDirection: 'row', gap: 20 }}>
      <Money amount={1100} delta v="title" />
      <Money amount={550} delta />
      <Money amount={-300} delta />
    </View>
  </Paper>
);

export const Inline = () => (
  <Paper width={360}>
    <T v="body">Cash after <Money amount={3150} v="title" /></T>
    <T v="small">absorbed at <Money amount={700} v="small" /> a share</T>
  </Paper>
);

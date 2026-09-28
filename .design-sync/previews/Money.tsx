import * as React from 'react';
import { Money, RN, T } from 'iron-and-gold';
import { Paper } from './_kit';

const { View } = RN;
const row = { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' };

export const Sizes = () => (
  <Paper width={320}>
    {['display', 'title', 'strong', 'body', 'small'].map((v) => (
      <View key={v} style={row}>
        <T v="small">{v}</T>
        <Money amount={12450} v={v as any} />
      </View>
    ))}
  </Paper>
);

export const Inline = () => (
  <Paper width={360}>
    <T v="body">Cash after <Money amount={3150} v="title" /></T>
    <T v="small">absorbed at <Money amount={700} v="small" /> a share</T>
  </Paper>
);

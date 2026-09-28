import * as React from 'react';
import { RN, Rule, T } from 'iron-and-gold';
import { Paper } from './_kit';

const { View } = RN;

export const Kinds = () => (
  <Paper width={360} style={{ gap: 18 }}>
    {['hair', 'gilt', 'ornament', 'rail'].map((k) => (
      <View key={k} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <T v="small" style={{ width: 64 }}>{k}</T>
        <Rule kind={k as any} style={{ flex: 1 }} />
      </View>
    ))}
  </Paper>
);

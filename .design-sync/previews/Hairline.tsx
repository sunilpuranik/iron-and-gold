import * as React from 'react';
import { Hairline, Money, RN, T } from 'iron-and-gold';
import { Paper } from './_kit';

const { View } = RN;
const rows = [['Continental Wire', 400], ['Red Mesa Oil', 700], ['First Territorial Bank', 1100]];

export const ListDividers = () => (
  <Paper width={340} style={{ gap: 0 }}>
    {rows.map(([n, p], i) => (
      <View key={n as string}>
        {i > 0 && <Hairline />}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10 }}>
          <T v="strong">{n}</T>
          <Money amount={p as number} />
        </View>
      </View>
    ))}
  </Paper>
);

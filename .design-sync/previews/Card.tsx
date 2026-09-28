import * as React from 'react';
import {
  Card, DoubleRule, Money, RN, T, useTheme,
} from 'iron-and-gold';
import { Paper } from './_kit';

const { View } = RN;

export const LedgerCard = () => {
  const th = useTheme();
  return (
    <Paper width={360}>
      <Card>
        <T v="title">Your position</T>
        <T v="accent" color={th.inkSoft}>Net worth at today's prices</T>
        <DoubleRule style={{ marginVertical: 10 }} />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <T>Cash on hand</T>
          <Money amount={4200} />
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
          <T>Shares held</T>
          <Money amount={3850} />
        </View>
      </Card>
    </Paper>
  );
};

export const Notice = () => {
  const th = useTheme();
  return (
    <Paper width={360}>
      <Card>
        <T v="plate">The town charter is signed</T>
        <T v="body" color={th.inkSoft} style={{ marginTop: 6 }}>
          Four tycoons have surveyed their first plots. Eleanor Vance builds first.
        </T>
      </Card>
    </Paper>
  );
};

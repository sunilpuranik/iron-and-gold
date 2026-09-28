import * as React from 'react';
import { Keyline, RN, T, useTheme } from 'iron-and-gold';
import { Paper } from './_kit';

const { View } = RN;

export const EngravedFrame = () => {
  const th = useTheme();
  return (
    <Paper width={320}>
      <View style={{ backgroundColor: th.ledger, borderWidth: 2, borderColor: th.ink, padding: 18, alignItems: 'center' }}>
        <Keyline color={th.gilt} inset={4} />
        <T v="plate">Tycoon of the frontier</T>
      </View>
    </Paper>
  );
};

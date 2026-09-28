import * as React from 'react';
import { GoldFill, RN, T, useTheme } from 'iron-and-gold';
import { Paper } from './_kit';

const { View } = RN;

export const Leaf = () => {
  const th = useTheme();
  return (
    <Paper width={320}>
      <View style={{ height: 72, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderWidth: 1, borderColor: th.goldLeaf.lo }}>
        <GoldFill />
        <T v="plate" color={th.goldLeaf.ink}>Gold leaf</T>
      </View>
    </Paper>
  );
};

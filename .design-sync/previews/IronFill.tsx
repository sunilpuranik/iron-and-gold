import * as React from 'react';
import { IronFill, RN, Rivets, T, useTheme } from 'iron-and-gold';
import { Paper } from './_kit';

const { View } = RN;

export const Plate = () => {
  const th = useTheme();
  return (
    <Paper width={320}>
      <View style={{ height: 72, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        <IronFill />
        <Rivets size={6} inset={6} />
        <T v="plate" color={th.iron.text}>Brushed iron</T>
      </View>
    </Paper>
  );
};

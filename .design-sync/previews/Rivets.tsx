import * as React from 'react';
import { RN, Rivets, T, useTheme } from 'iron-and-gold';
import { Paper } from './_kit';

const { View } = RN;

export const Corners = () => {
  const th = useTheme();
  return (
    <Paper width={320}>
      <View style={{ backgroundColor: th.ledger, borderWidth: 3, borderColor: th.iron.mid, padding: 22, alignItems: 'center' }}>
        <Rivets size={7} inset={-5} />
        <T v="plate">Riveted to the frame</T>
      </View>
      <View style={{ backgroundColor: th.paper, borderWidth: 2, borderColor: th.iron.mid, padding: 16, alignItems: 'center' }}>
        <Rivets size={5} inset={-3.5} />
        <T v="small">Telegram card rivets</T>
      </View>
    </Paper>
  );
};

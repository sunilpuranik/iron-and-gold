import * as React from 'react';
import { ExchangeView, RN, useTheme } from 'iron-and-gold';
import { midGame } from './_kit';

const { View } = RN;

export const Exchange = () => {
  const th = useTheme();
  return (
    <View style={{ width: 400, height: 1180, backgroundColor: th.ground }}>
      <ExchangeView state={midGame()} mySeat={0} showMine onMap={() => {}} onCertificate={() => {}} onTicker={() => {}} />
    </View>
  );
};

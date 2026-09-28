import * as React from 'react';
import { Button, DoubleRule, Emblem, RN, Screen, T, Wordmark, useTheme } from 'iron-and-gold';

const { View } = RN;

export const Page = () => {
  const th = useTheme();
  return (
    <View style={{ width: 360, height: 420 }}>
      <Screen style={{ padding: 20, gap: 14, alignItems: 'center', justifyContent: 'center' }}>
        <Emblem size={88} />
        <Wordmark size={30} align="center" />
        <T v="accent" color={th.inkSoft}>A frontier game of plots, charters and buyouts</T>
        <DoubleRule style={{ alignSelf: 'stretch' }} />
        <Button title="Play with bots" style={{ alignSelf: 'stretch' }} />
      </Screen>
    </View>
  );
};

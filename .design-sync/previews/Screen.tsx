import * as React from 'react';
import {
  Button, RN, Rule, Screen, Seal, T, Wordmark, useTheme,
} from 'iron-and-gold';

const { View } = RN;

export const Page = () => {
  const th = useTheme();
  return (
    <View style={{ width: 360, height: 440 }}>
      <Screen style={{ padding: 20, gap: 14, alignItems: 'center', justifyContent: 'center' }}>
        <Seal kind="coin" size={96} />
        <Wordmark size={30} align="center" />
        <T v="accent" color={th.inkSoft}>A frontier rail town, 1881</T>
        <Rule kind="ornament" style={{ alignSelf: 'stretch' }} />
        <Button title="Deal a local game" style={{ alignSelf: 'stretch' }} />
      </Screen>
    </View>
  );
};

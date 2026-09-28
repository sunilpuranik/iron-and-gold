import * as React from 'react';
import { Button, Icons, Money, RN, Sheet, T, useTheme } from 'iron-and-gold';

const { View } = RN;

export const WithFooter = () => {
  const th = useTheme();
  return (
    <Sheet
      visible
      title="Sell your holdings"
      subtitle="Red Mesa Oil is being absorbed"
      onClose={() => {}}
      footer={<Button title="Confirm sale" icon={Icons.Landmark} />}
    >
      <T v="body" color={th.inkSoft}>Shares absorbed in a buyout can be sold to the bank at the closing price.</T>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <T v="strong">4 shares at $700</T>
        <Money amount={2800} v="title" />
      </View>
    </Sheet>
  );
};

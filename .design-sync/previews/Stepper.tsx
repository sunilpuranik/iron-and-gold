import * as React from 'react';
import {
  CompanyMark, Money, RN, Stepper, T, useTheme,
} from 'iron-and-gold';
import { Paper } from './_kit';

const { View } = RN;

function Row({ id, name, price, start, max }: any) {
  const th = useTheme();
  const [n, setN] = React.useState(start);
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 48 }}>
      <CompanyMark id={id} size={40} />
      <View style={{ flex: 1 }}>
        <T v="strong">{name}</T>
        <T v="small" color={th.inkSoft}>6 plots · bank 18</T>
      </View>
      <Money amount={price} size={15} />
      <Stepper label={name} value={n} max={max} onChange={setN} />
    </View>
  );
}

export const InvestRows = () => (
  <Paper width={380}>
    <Row id="pw" name="Plains & W." price={600} start={1} max={3} />
    <Row id="rm" name="Red Mesa" price={500} start={0} max={3} />
  </Paper>
);

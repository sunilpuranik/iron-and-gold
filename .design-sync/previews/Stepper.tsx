import * as React from 'react';
import { CompanyIcon, Money, RN, Stepper, T, useTheme } from 'iron-and-gold';
import { Paper } from './_kit';

const { View } = RN;

function Row({ id, name, price, start, max }: any) {
  const th = useTheme();
  const [n, setN] = React.useState(start);
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 48 }}>
      <CompanyIcon id={id} size={32} />
      <View style={{ flex: 1 }}>
        <T v="strong">{name}</T>
        <T v="small" color={th.inkSoft}><Money amount={price} v="small" /> · bank 18</T>
      </View>
      <Stepper label={name} value={n} max={max} onChange={setN} />
    </View>
  );
}

export const InvestRows = () => (
  <Paper width={380}>
    <Row id="rm" name="Red Mesa" price={700} start={2} max={3} />
    <Row id="cw" name="Wire" price={400} start={0} max={3} />
  </Paper>
);

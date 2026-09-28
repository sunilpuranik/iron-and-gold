import * as React from 'react';
import { RN, T, Tile, useTheme } from 'iron-and-gold';
import { Paper } from './_kit';

const { View } = RN;

function Cell({ label, ...p }: any) {
  const th = useTheme();
  return (
    <View style={{ alignItems: 'center', gap: 4, width: 70 }}>
      <Tile w={44} h={44} {...p} />
      <T v="small" color={th.inkSoft} style={{ textAlign: 'center' }}>{label}</T>
    </View>
  );
}

export const States = () => (
  <Paper width={420}>
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
      <Cell id="B3" district="river" label="Empty" />
      <Cell id="C3" district="river" mine label="In hand" />
      <Cell id="D6" district="foundry" mine selected label="Selected" />
      <Cell id="E6" district="foundry" owner="x" label="Loose" />
      <Cell id="F10" district="main" owner="rm" companySize={4} label="Company" />
      <Cell id="G10" district="main" owner="pw" companySize={12} trust label="Trust" />
      <Cell id="H10" district="main" owner="ae" companySize={7} last label="Last built" />
    </View>
  </Paper>
);

import * as React from 'react';
import { COMPANY_IDS, RaisedTile, RN } from 'iron-and-gold';
import { Paper } from './_kit';

const { View } = RN;

export const AllCompanies = () => (
  <Paper width={440}>
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
      {COMPANY_IDS.map((id) => <RaisedTile key={id} id={id} size={72} />)}
    </View>
  </Paper>
);

export const Large = () => (
  <Paper width={200}>
    <RaisedTile id="ae" size={128} />
  </Paper>
);

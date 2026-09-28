import * as React from 'react';
import { Portrait, RN } from 'iron-and-gold';
import { Paper } from './_kit';

const { View } = RN;

export const Cameos = () => (
  <Paper width={440}>
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
      {[0, 1, 2, 3, 4, 5].map((i) => <Portrait key={i} index={i} size={120} />)}
    </View>
  </Paper>
);

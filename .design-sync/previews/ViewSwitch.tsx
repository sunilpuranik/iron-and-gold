import * as React from 'react';
import { RN, ViewSwitch } from 'iron-and-gold';
import { Paper } from './_kit';

const { View } = RN;

function Live({ start, mine }: any) {
  const [view, setView] = React.useState(start);
  return <ViewSwitch view={view} onView={setView} mine={mine} />;
}

export const States = () => (
  <Paper width={320}>
    <View style={{ flexDirection: 'row', gap: 20 }}>
      <Live start="map" />
      <Live start="exchange" />
      <Live start="exchange" mine />
    </View>
  </Paper>
);

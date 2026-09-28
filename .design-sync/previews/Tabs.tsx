import * as React from 'react';
import { Icons, RN, Tabs } from 'iron-and-gold';
import { Paper } from './_kit';

const { View } = RN;

function Underline({ start }: any) {
  const [tab, setTab] = React.useState(start);
  return <Tabs value={tab} onChange={setTab} />;
}

function Switch({ start, flag }: any) {
  const [view, setView] = React.useState(start);
  return (
    <Tabs
      kind="switch"
      value={view}
      onChange={setView}
      items={[
        { key: 'map', label: 'Show the map', icon: Icons.Map, flag: flag && view !== 'map' },
        { key: 'exchange', label: 'Show the exchange', icon: Icons.ChartColumn },
      ]}
    />
  );
}

export const Underlined = () => <Paper width={380} pad={0}><Underline start="Deeds" /></Paper>;
export const MarketSelected = () => <Paper width={380} pad={0}><Underline start="Market" /></Paper>;
export const MapSwitch = () => (
  <Paper width={320}>
    <View style={{ flexDirection: 'row', gap: 20 }}>
      <Switch start="map" />
      <Switch start="exchange" />
      <Switch start="exchange" flag />
    </View>
  </Paper>
);

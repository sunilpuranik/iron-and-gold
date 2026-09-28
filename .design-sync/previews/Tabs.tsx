import * as React from 'react';
import { Tabs } from 'iron-and-gold';
import { Paper } from './_kit';

function Live({ start }: any) {
  const [tab, setTab] = React.useState(start);
  return <Tabs tab={tab} onTab={setTab} />;
}

export const Deeds = () => <Paper width={380} pad={0}><Live start="Deeds" /></Paper>;
export const Market = () => <Paper width={380} pad={0}><Live start="Market" /></Paper>;

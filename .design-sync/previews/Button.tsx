import * as React from 'react';
import { Button, Icons, RN } from 'iron-and-gold';
import { Paper } from './_kit';

const { View } = RN;

export const Kinds = () => (
  <Paper width={340}>
    <Button title="Invest" icon={Icons.Landmark} />
    <Button title="Pass" kind="iron" />
    <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
      <Button title="Add a seat" kind="ghost" icon={Icons.Plus} style={{ flex: 1 }} />
      <Button iconOnly icon={Icons.X} label="Remove seat" />
    </View>
  </Paper>
);

export const CompactRow = () => (
  <Paper width={380}>
    <View style={{ flexDirection: 'row', gap: 8 }}>
      <Button title="Pass" kind="ghost" compact />
      <Button title="Bell" kind="iron" icon={Icons.Bell} compact />
      <Button title="Invest" icon={Icons.Landmark} style={{ flex: 1 }} />
    </View>
  </Paper>
);

export const Disabled = () => (
  <Paper width={340}>
    <Button title="Tap a deed to build" icon={Icons.Hammer} disabled />
    <Button title="Pass" kind="iron" disabled />
  </Paper>
);

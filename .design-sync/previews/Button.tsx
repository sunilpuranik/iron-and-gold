import * as React from 'react';
import { Button, Icons, RN } from 'iron-and-gold';
import { Paper } from './_kit';

const { View } = RN;

export const Primary = () => (
  <Paper width={340}>
    <Button title="Invest" icon={Icons.Landmark} />
    <Button title="Build on C7 · Foundry Row" icon={Icons.Hammer} />
  </Paper>
);

export const Kinds = () => (
  <Paper width={340}>
    <Button title="Charter a company" kind="primary" />
    <Button title="Closing bell results" kind="secondary" icon={Icons.Bell} />
    <Button title="Back to town" kind="tertiary" />
  </Paper>
);

export const CompactRow = () => (
  <Paper width={380}>
    <View style={{ flexDirection: 'row', gap: 8 }}>
      <Button title="Pass" kind="tertiary" compact />
      <Button title="Bell" kind="secondary" icon={Icons.Bell} compact />
      <Button title="Invest" icon={Icons.Landmark} style={{ flex: 1 }} />
    </View>
  </Paper>
);

export const Disabled = () => (
  <Paper width={340}>
    <Button title="Tap a deed to build" icon={Icons.Hammer} disabled />
    <Button title="Pass" kind="tertiary" disabled />
  </Paper>
);

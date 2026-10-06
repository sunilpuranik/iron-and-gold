import * as React from 'react';
import { InviteCard } from 'iron-and-gold';
import { Paper } from './_kit';

function Card({ start, compact }: { start: string; compact?: boolean }) {
  const [name, setName] = React.useState(start);
  return <InviteCard code="WXRT" name={name} onName={setName} onJoin={() => {}} compact={compact} />;
}

export const FromALink = () => (
  <Paper pad={24} width={520}>
    <Card start="Calamity Kate" />
  </Paper>
);

export const CompactNoName = () => (
  <Paper pad={16} width={360}>
    <Card start="" compact />
  </Paper>
);

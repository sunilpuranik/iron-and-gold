import * as React from 'react';
import { WantedPoster } from 'iron-and-gold';
import { Paper } from './_kit';

function Poster({ start, alias = '', compact }: { start: number; alias?: string; compact?: boolean }) {
  const [name, setName] = React.useState(alias);
  const [avatar, setAvatar] = React.useState(start);
  return <WantedPoster name={name} onName={setName} avatar={avatar} onAvatar={setAvatar} compact={compact} />;
}

export const RailKing = () => (
  <Paper pad={28} width={520}>
    <Poster start={3} alias="Eleanor Vance" />
  </Paper>
);

export const CompactNewcomer = () => (
  <Paper pad={20} width={380}>
    <Poster start={2} compact />
  </Paper>
);

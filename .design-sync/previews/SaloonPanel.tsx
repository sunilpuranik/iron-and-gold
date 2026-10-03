import * as React from 'react';
import { SaloonPanel } from 'iron-and-gold';
import { Paper } from './_kit';

const UID = 'u-eleanor';
const ROOMS = [
  {
    code: 'WXRT', title: 'Friday Night Rails', status: 'playing', turn_of: UID,
    lobby: { host: UID, players: [{ id: UID, name: 'Eleanor' }, { id: 'u2', name: 'Barlow' }, { id: 'u3', name: 'Pike' }] },
  },
  {
    code: 'KLMB', title: 'The Harlan Cup', status: 'playing', turn_of: 'u4',
    lobby: { host: 'u4', players: [{ id: 'u4', name: 'Harlan' }, { id: UID, name: 'Eleanor' }] },
  },
  {
    code: 'QZDP', title: null, status: 'lobby', turn_of: null,
    lobby: { host: UID, players: [{ id: UID, name: 'Eleanor' }, { id: 'u5', name: 'Doc' }] },
  },
];

function Panel(props: any) {
  const [query, setQuery] = React.useState(props.query ?? '');
  const noop = () => {};
  return (
    <SaloonPanel
      enabled
      tables={{ uid: UID, rows: ROOMS }}
      onHost={noop}
      onJoin={noop}
      onOpen={noop}
      onDelete={noop}
      {...props}
      query={query}
      onQuery={setQuery}
    />
  );
}

export const MyRooms = () => (
  <Paper pad={24} width={520}>
    <Panel />
  </Paper>
);

export const JoinByCode = () => (
  <Paper pad={24} width={520}>
    <Panel query="hgtf" />
  </Paper>
);

export const NoTablesYet = () => (
  <Paper pad={24} width={520}>
    <Panel tables={{ uid: UID, rows: [] }} />
  </Paper>
);

export const CompactWithError = () => (
  <Paper pad={16} width={360}>
    <Panel compact err="That room is full. Ask the host for another table." />
  </Paper>
);

export const Offline = () => (
  <Paper pad={24} width={520}>
    <Panel enabled={false} />
  </Paper>
);

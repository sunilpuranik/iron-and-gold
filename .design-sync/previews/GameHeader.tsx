import * as React from 'react';
import { GameHeader } from 'iron-and-gold';
import { Paper, midGame } from './_kit';

function Live({ mine }: any) {
  const s = midGame();
  const [view, setView] = React.useState(mine ? 'map' : 'exchange');
  return <GameHeader state={s} me={s.players[0]} view={view} onView={setView} mine={mine} />;
}

export const YourTurn = () => <Paper width={400} pad={0}><Live mine /></Paper>;
export const Watching = () => <Paper width={400} pad={0}><Live mine={false} /></Paper>;

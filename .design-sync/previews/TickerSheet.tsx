import * as React from 'react';
import { TickerSheet } from 'iron-and-gold';
import { midGame } from './_kit';

export const Telegraph = () => {
  const [on, setOn] = React.useState(true);
  return <TickerSheet visible state={midGame()} dispatches={on} onDispatches={setOn} onClose={() => {}} />;
};

import * as React from 'react';
import { DispatchLines, turnsSince } from 'iron-and-gold';
import { Paper, midGame } from './_kit';

export const Telegram = () => {
  const d = turnsSince(midGame(), 0).filter((x) => x.lines.length).slice(-1)[0];
  return <Paper width={340}><DispatchLines d={d} /></Paper>;
};

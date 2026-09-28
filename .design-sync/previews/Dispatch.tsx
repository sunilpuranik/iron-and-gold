import * as React from 'react';
import {
  Dispatch, RN, turnsSince, useTheme,
} from 'iron-and-gold';
import { Paper, liveClock, midGame } from './_kit';

const { View } = RN;
liveClock();

export const Toast = () => {
  const th = useTheme();
  const ds = turnsSince(midGame(), 0).filter((x) => x.lines.length);
  const latest = ds[ds.length - 1];
  // Re-send the dispatch whenever it dismisses itself, so the card never sits empty.
  const [d, setD] = React.useState(latest);
  return (
    <View style={{ width: 400, height: 220, backgroundColor: th.ground }}>
      <Dispatch as="toast" dispatch={d} extra={ds.length - 1} onDone={() => setD({ ...latest })} />
    </View>
  );
};

export const Recap = () => (
  <Paper width={380}>
    <Dispatch as="recap" dispatches={turnsSince(midGame(), 0)} />
  </Paper>
);

export const Lines = () => {
  const d = turnsSince(midGame(), 0).filter((x) => x.lines.length).slice(-1)[0];
  return <Paper width={340}><Dispatch as="lines" dispatch={d} /></Paper>;
};

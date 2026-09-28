import * as React from 'react';
import { DispatchToast, RN, useTheme, turnsSince } from 'iron-and-gold';
import { liveClock, midGame } from './_kit';

const { View } = RN;
liveClock();

export const Arriving = () => {
  const th = useTheme();
  const ds = turnsSince(midGame(), 0).filter((x) => x.lines.length);
  const latest = ds[ds.length - 1];
  // Re-send the dispatch whenever it dismisses itself, so the card never sits empty.
  const [d, setD] = React.useState(latest);
  return (
    <View style={{ width: 400, height: 220, backgroundColor: th.ledger }}>
      <DispatchToast dispatch={d} extra={ds.length - 1} onDone={() => setD({ ...latest })} />
    </View>
  );
};

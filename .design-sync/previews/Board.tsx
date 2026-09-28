import * as React from 'react';
import { Board, RN, useTheme } from 'iron-and-gold';
import { midGame } from './_kit';

const { View } = RN;

function Frame({ children }: any) {
  const th = useTheme();
  return <View style={{ width: 390, height: 520, backgroundColor: th.ground }}>{children}</View>;
}

export const MidGame = () => {
  const s = midGame();
  const [sel, setSel] = React.useState(null);
  return (
    <Frame>
      <Board state={s} myHand={s.players[0].hand} canPick selected={sel} onTilePress={setSel} />
    </Frame>
  );
};

export const PickingADeed = () => {
  const s = midGame();
  return (
    <Frame>
      <Board state={s} myHand={s.players[0].hand} canPick selected={s.players[0].hand[0]} />
    </Frame>
  );
};

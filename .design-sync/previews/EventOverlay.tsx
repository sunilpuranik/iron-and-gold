import * as React from 'react';
import { EventOverlay, RN } from 'iron-and-gold';
import { inPhase, liveClock, play } from './_kit';

const { View } = RN;
liveClock();
const Stage = ({ children }: any) => <View style={{ width: 400, height: 720, backgroundColor: '#2B2D31' }}>{children}</View>;

export const Buyout = () => {
  const s = inPhase('dispose');
  return <Stage><EventOverlay event={{ fx: s.fx }} state={s} remaining={1} /></Stage>;
};

export const Chartered = () => {
  const s = play({ seed: 7, max: 60, until: (x) => x.fx && x.fx.kind === 'found' && x.turnNo > 3 });
  return <Stage><EventOverlay event={{ fx: s.fx }} state={s} /></Stage>;
};

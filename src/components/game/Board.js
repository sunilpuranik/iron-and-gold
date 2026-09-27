// The city map: 9 display columns (A–I) × 12 display rows (1–12) in three district blocks.
// Tiles stretch to fill the full width; height fits what is left on screen.
import { useMemo, useRef, useState } from 'react';
import { View } from 'react-native';
import { useTheme } from '../../theme/theme';
import { T } from '../../theme/ui';
import { DISTRICTS, ROWS, districtOf, manhattan } from '../../game/data';
import { isTrust, sizes } from '../../game/engine';
import Tile from './Tile';

const GAP = 2;
const BAND = 18;
const SIDE = 6;

export default function Board({
  state, myHand, canPick, selected, onTilePress,
}) {
  const th = useTheme();
  const [box, setBox] = useState(null);

  // Delay for plots whose owner changed since the last board we saw.
  const prevBoard = useRef(state.board);
  const delays = useRef({});
  const seenFx = useRef(state.fx ? state.fx.seq : -1);
  if (prevBoard.current !== state.board) {
    const fx = state.fx;
    const next = {};
    if (fx && fx.tile && fx.seq !== seenFx.current) {
      for (const t of Object.keys(state.board)) {
        if (prevBoard.current[t] !== state.board[t]) next[t] = Math.min(900, manhattan(t, fx.tile) * 70);
      }
      seenFx.current = fx.seq;
    }
    delays.current = next;
    prevBoard.current = state.board;
  }

  const sz = useMemo(() => sizes(state), [state.board]);
  const hand = useMemo(() => new Set(myHand || []), [myHand]);
  const focus = selected ? districtOf(selected).key : null;

  let w = 0;
  let h = 0;
  if (box) {
    w = Math.floor((box.w - 8 * GAP) / 9);
    h = Math.floor((box.h - 3 * BAND - 9 * GAP) / 12);
    h = Math.max(12, Math.min(h, Math.round(w * 1.1)));
  }

  return (
    <View
      style={{ flex: 1, justifyContent: 'center', paddingHorizontal: SIDE, paddingVertical: 2 }}
      onLayout={(e) => {
        const { width, height } = e.nativeEvent.layout;
        setBox({ w: width - 2 * SIDE, h: height - 4 });
      }}
    >
      {w > 0 && (
        <View style={{ alignSelf: 'center' }}>
          {DISTRICTS.map((d) => {
            const dc = th.districts[d.key];
            const on = focus === d.key;
            return (
              <View key={d.key}>
                <View style={{ height: BAND, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <View style={{ flex: 1, height: on ? 2 : 1, backgroundColor: dc.accent, opacity: on ? 1 : 0.6 }} />
                  <T
                    v={on ? 'strong' : 'accent'}
                    color={on ? th.ink : dc.accent}
                    style={{ fontSize: on ? 12 : 13 }}
                  >
                    {on ? `Building in ${d.name}` : d.name}
                  </T>
                  <View style={{ flex: 1, height: on ? 2 : 1, backgroundColor: dc.accent, opacity: on ? 1 : 0.6 }} />
                </View>
                {Array.from({ length: d.to - d.from + 1 }, (_, i) => d.from + i).map((c, ri) => (
                  <View key={c} style={{ flexDirection: 'row', gap: GAP, marginTop: ri === 0 ? 0 : GAP }}>
                    {ROWS.map((r) => {
                      const id = r + c;
                      const owner = state.board[id];
                      return (
                        <Tile
                          key={id}
                          id={id}
                          w={w}
                          h={h}
                          owner={owner}
                          companySize={owner && owner !== 'x' ? sz[owner] : 0}
                          district={d.key}
                          mine={!owner && hand.has(id)}
                          selected={selected === id}
                          trust={owner && owner !== 'x' ? isTrust(sz[owner]) : false}
                          last={state.last === id}
                          delay={delays.current[id]}
                          onPress={canPick && !owner && hand.has(id) ? onTilePress : undefined}
                        />
                      );
                    })}
                  </View>
                ))}
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

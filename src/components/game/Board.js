// The city map: 9 display columns (A–I) × 12 display rows (1–12), three district bands.
import { useMemo, useRef, useState } from 'react';
import { View } from 'react-native';
import { useTheme } from '../../theme/theme';
import { T } from '../../theme/ui';
import { DISTRICTS, ROWS, districtOf, manhattan } from '../../game/data';
import { isTrust, sizes } from '../../game/engine';
import Tile from './Tile';

const GAP = 2;
const AVENUE = 8; // extra gap after display columns C and F
const BAND = 16;

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

  let px = 0;
  if (box) {
    const w = (box.w - 8 * GAP - 2 * AVENUE) / 9;
    const h = (box.h - 3 * BAND - 9 * GAP) / 12;
    px = Math.max(10, Math.floor(Math.min(w, h)));
  }

  return (
    <View
      style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8, paddingVertical: 4 }}
      onLayout={(e) => {
        const { width, height } = e.nativeEvent.layout;
        setBox({ w: width - 16, h: height - 8 });
      }}
    >
      {px > 0 && (
        <View>
          {DISTRICTS.map((d) => (
            <View key={d.key}>
              <View style={{ height: BAND, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <View style={{ flex: 1, height: 1, backgroundColor: th.districts[d.key].accent, opacity: 0.6 }} />
                <T v="accent" color={th.districts[d.key].accent} style={{ fontSize: 12 }}>{d.name}</T>
                <View style={{ flex: 1, height: 1, backgroundColor: th.districts[d.key].accent, opacity: 0.6 }} />
              </View>
              {Array.from({ length: d.to - d.from + 1 }, (_, i) => d.from + i).map((c, ri) => (
                <View key={c} style={{ flexDirection: 'row', marginTop: ri === 0 ? 0 : GAP }}>
                  {ROWS.map((r, ci) => {
                    const id = r + c;
                    const owner = state.board[id];
                    return (
                      <View key={id} style={{ marginLeft: ci === 0 ? 0 : GAP + (ci === 3 || ci === 6 ? AVENUE : 0) }}>
                        <Tile
                          id={id}
                          px={px}
                          owner={owner}
                          companySize={owner && owner !== 'x' ? sz[owner] : 0}
                          district={districtOf(id).key}
                          mine={!owner && hand.has(id)}
                          selected={selected === id}
                          trust={owner && owner !== 'x' ? isTrust(sz[owner]) : false}
                          last={state.last === id}
                          delay={delays.current[id]}
                          onPress={canPick && !owner && hand.has(id) ? onTilePress : undefined}
                        />
                      </View>
                    );
                  })}
                </View>
              ))}
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

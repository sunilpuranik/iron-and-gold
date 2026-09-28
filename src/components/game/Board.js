// The city map: 9 display columns (A–I) × 12 display rows (1–12) in three district blocks.
// Tiles stretch to fill the full width; height fits what is left on screen.
import {
  memo, useCallback, useLayoutEffect, useMemo, useRef, useState,
} from 'react';
import { Animated, Pressable, View } from 'react-native';
import Svg, { Line } from 'react-native-svg';
import { useTheme } from '../../theme/theme';
import { T } from '../../theme/ui';
import { DISTRICTS, ROWS, districtOf, manhattan } from '../../game/data';
import { isTrust, sizes } from '../../game/engine';
import { companyGlyph } from '../CompanyMark';

function Hatch({ w, h, color }) {
  const lines = [];
  for (let i = -h; i < w; i += 6) {
    lines.push(<Line key={i} x1={i} y1={h} x2={i + h} y2={0} stroke={color} strokeWidth={1} opacity={0.55} />);
  }
  return (
    <Svg width={w} height={h} style={{ position: 'absolute', left: 0, top: 0 }}>
      {lines}
    </Svg>
  );
}

// Company icon grows with company size.
function iconScale(size) {
  if (size >= 21) return 0.9;
  if (size >= 11) return 0.8;
  if (size >= 6) return 0.68;
  return 0.56;
}

// One plot on the city map. Colour changes animate after `delay` ms so buyouts flood outward.
function Tile({
  id, w, h, owner, companySize, district, mine, selected, trust, last, delay, onPress,
}) {
  const th = useTheme();
  const d = th.districts[district];
  const co = owner && owner !== 'x' ? th.companies[owner] : null;

  let fill = d.wash;
  if (selected) fill = th.ink;
  else if (co) fill = co.fill;
  else if (owner === 'x' || mine) fill = d.tint;

  // Cross-fade from the previous fill to the new one.
  const prevFill = useRef(fill);
  const fromFill = useRef(fill);
  const anim = useRef(new Animated.Value(1)).current;
  if (prevFill.current !== fill) {
    fromFill.current = prevFill.current;
    prevFill.current = fill;
  }
  useLayoutEffect(() => {
    anim.stopAnimation();
    if (delay == null || fromFill.current === fill) {
      anim.setValue(1);
      return;
    }
    anim.setValue(0);
    Animated.timing(anim, { toValue: 1, duration: 320, delay, useNativeDriver: false }).start();
  }, [fill]);

  let borderColor = th.rule;
  let borderWidth = 1;
  let borderStyle = 'solid';
  if (co && trust) {
    borderColor = th.gilt;
    borderWidth = 2;
  }
  if (mine && !co && !selected) {
    borderColor = th.gilt;
    borderStyle = 'dashed';
    borderWidth = 1.5;
  }
  if (selected) borderColor = th.gilt;
  if (last && !selected) {
    borderColor = th.ink;
    borderWidth = 2;
  }

  const m = Math.min(w, h);
  const Glyph = co ? companyGlyph(owner) : null;
  const showLabel = !co && m >= 20;
  const labelColor = selected ? th.onInk : mine ? th.ink : owner === 'x' ? d.accent : th.inkSoft;

  return (
    <Pressable
      onPress={onPress ? () => onPress(id) : undefined}
      disabled={!onPress}
      accessibilityLabel={co ? `Plot ${id}, company plot. Open share certificate.` : `Plot ${id}`}
      style={{ width: w, height: h }}
    >
      <View style={{ width: w, height: h, backgroundColor: fromFill.current, overflow: 'hidden' }}>
        <Animated.View style={{ position: 'absolute', left: 0, top: 0, width: w, height: h, backgroundColor: fill, opacity: anim }} />
        {owner === 'x' && !selected && <Hatch w={w} h={h} color={d.accent} />}
        {Glyph && (
          <Animated.View style={{ position: 'absolute', left: 0, top: 0, width: w, height: h, alignItems: 'center', justifyContent: 'center', opacity: anim }}>
            <Glyph size={Math.round(m * iconScale(companySize))} color={co.ink} strokeWidth={trust ? 2 : 1.5} />
          </Animated.View>
        )}
        {showLabel && (
          <View style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }}>
            <T
              v={mine || selected ? 'strong' : 'small'}
              color={labelColor}
              style={{ fontSize: Math.max(9, Math.min(13, m / 2.8)), opacity: mine || selected || owner ? 1 : 0.7 }}
            >
              {id}
            </T>
          </View>
        )}
        {co && trust && (
          <View
            style={{
              position: 'absolute', top: 3, right: 3, width: 6, height: 6,
              backgroundColor: th.gilt, transform: [{ rotate: '45deg' }],
            }}
          />
        )}
        <View
          style={{
            position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, borderWidth, borderColor, borderStyle, pointerEvents: 'none',
          }}
        />
      </View>
    </Pressable>
  );
}

const Plot = memo(Tile);

const GAP = 2;
const BAND = 18;
const SIDE = 6;

export default function Board({
  state, myHand, canPick, selected, onTilePress, onCompanyPress,
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
  // Tapping a company's plot opens its share certificate.
  const board = state.board;
  const onCompanyTile = useCallback((tile) => onCompanyPress && onCompanyPress(board[tile]), [board, onCompanyPress]);

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
                        <Plot
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
                          onPress={
                            owner && owner !== 'x' ? onCompanyTile
                              : canPick && !owner && hand.has(id) ? onTilePress : undefined
                          }
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

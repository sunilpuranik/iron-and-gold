// The city map: 9 display columns (A–I) × 12 display rows (1–12) in three district blocks.
// Tiles stretch to fill the full width; height fits what is left on screen.
import {
  memo, useCallback, useLayoutEffect, useMemo, useRef, useState,
} from 'react';
import { Animated, Pressable, View } from 'react-native';
import Svg, { Line } from 'react-native-svg';
import { useTheme } from '../../theme/theme';
import { T } from '../../theme/ui';
import { FONTS } from '../../theme/tokens';
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

const GAP = 2;
const BAND = 18;
const SIDE = 6;

// Company icon grows with company size.
function iconScale(size) {
  if (size >= 21) return 0.9;
  if (size >= 11) return 0.8;
  if (size >= 6) return 0.68;
  return 0.56;
}

// One plot on the city map. Colour changes animate after `delay` ms so buyouts flood outward.
// Company plots are raised blocks (light top/left edge, dark bottom/right) that join their
// same-company neighbours across the gap, so a company reads as one holding. Empty plots are
// surveyed lots: a faint inner keyline and an engraved coordinate.
function Tile({
  id, w, h, owner, companySize, district, mine, selected, trust, last, delay, onPress, joinRight, joinDown, joinCorner, joinLeft, joinUp,
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

  let borderColor = co ? 'transparent' : th.rule;
  let borderWidth = 1;
  let borderStyle = 'solid';
  // A trust is outlined in gilt around the whole holding, so only on edges that don't join.
  let edges = null;
  if (co && trust) {
    borderColor = th.accent;
    edges = {
      borderTopWidth: joinUp ? 0 : 1.5, borderBottomWidth: joinDown ? 0 : 1.5,
      borderLeftWidth: joinLeft ? 0 : 1.5, borderRightWidth: joinRight ? 0 : 1.5,
    };
  }
  if (mine && !co && !selected) {
    borderColor = th.accent;
    borderStyle = 'dashed';
    borderWidth = 1.5;
  }
  if (selected) borderColor = th.selection;
  if (last && !selected) {
    borderColor = th.gold.bright;
    borderWidth = 2;
    edges = null;
  }
  if (selected) edges = null;

  const m = Math.min(w, h);
  const Glyph = co ? companyGlyph(owner) : null;
  const showLabel = !co && m >= 20;
  const labelColor = selected ? th.ground : mine ? th.ink : owner === 'x' ? d.accent : th.inkSoft;

  const fillNow = co ? co.fill : null;
  return (
    <Pressable
      onPress={onPress ? () => onPress(id) : undefined}
      disabled={!onPress}
      accessibilityLabel={co ? `Plot ${id}, company plot. Open share certificate.` : `Plot ${id}`}
      style={{ width: w, height: h }}
    >
      {/* Joins to same-company neighbours, drawn in the gap so the block reads as one. */}
      {co && joinRight && <Animated.View style={{ position: 'absolute', left: w, top: 0, width: GAP, height: h, backgroundColor: fillNow, opacity: anim }} />}
      {co && joinDown && <Animated.View style={{ position: 'absolute', left: 0, top: h, width: w, height: GAP, backgroundColor: fillNow, opacity: anim }} />}
      {co && joinCorner && <Animated.View style={{ position: 'absolute', left: w, top: h, width: GAP, height: GAP, backgroundColor: fillNow, opacity: anim }} />}
      {last && !selected && (
        <View
          pointerEvents="none"
          style={{
            position: 'absolute', left: -2, top: -2, width: w + 4, height: h + 4,
            shadowColor: th.gold.bright, shadowOpacity: 0.9, shadowRadius: 8, shadowOffset: { width: 0, height: 0 },
          }}
        />
      )}
      <View style={{ width: w, height: h, backgroundColor: fromFill.current, overflow: 'hidden' }}>
        <Animated.View style={{ position: 'absolute', left: 0, top: 0, width: w, height: h, backgroundColor: fill, opacity: anim }} />
        {owner === 'x' && !selected && <Hatch w={w} h={h} color={d.accent} />}
        {co && !selected && (
          <Animated.View pointerEvents="none" style={{ position: 'absolute', left: 0, top: 0, width: w, height: h, opacity: anim }}>
            {!joinDown && <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 2, backgroundColor: 'rgba(0,0,0,0.32)' }} />}
            {!joinRight && <View style={{ position: 'absolute', top: 0, bottom: 0, right: 0, width: 1.5, backgroundColor: 'rgba(0,0,0,0.22)' }} />}
            <View style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 1, backgroundColor: 'rgba(255,255,255,0.22)' }} />
            <View style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: 1, backgroundColor: 'rgba(255,255,255,0.14)' }} />
          </Animated.View>
        )}
        {!co && !owner && !selected && m >= 20 && (
          <View pointerEvents="none" style={{ position: 'absolute', left: 3, top: 3, right: 3, bottom: 3, borderWidth: 1, borderColor: d.accent, opacity: 0.16 }} />
        )}
        {Glyph && (
          <Animated.View style={{ position: 'absolute', left: 0, top: 0, width: w, height: h, alignItems: 'center', justifyContent: 'center', opacity: anim }}>
            <Glyph size={Math.round(m * iconScale(companySize))} color={co.ink} strokeWidth={trust ? 2 : 1.5} />
          </Animated.View>
        )}
        {showLabel && (
          <View style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }}>
            <T
              color={labelColor}
              style={{
                fontFamily: mine || selected ? FONTS.display : FONTS.engraved,
                fontSize: Math.max(9, Math.min(13, m / 2.8)),
                letterSpacing: 0.4,
                opacity: mine || selected || owner ? 1 : 0.62,
              }}
            >
              {id}
            </T>
          </View>
        )}
        {co && trust && (
          <View
            style={{
              position: 'absolute', top: 3, right: 3, width: 6, height: 6,
              backgroundColor: th.accent, transform: [{ rotate: '45deg' }],
            }}
          />
        )}
        <View
          style={{
            position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, borderWidth, borderColor, borderStyle, pointerEvents: 'none', ...edges,
          }}
        />
      </View>
    </Pressable>
  );
}

const Plot = memo(Tile);

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
                    {ROWS.map((r, ci) => {
                      const id = r + c;
                      const owner = state.board[id];
                      const co = owner && owner !== 'x' ? owner : null;
                      // Join within a district block only (bands separate the blocks).
                      const right = ci < ROWS.length - 1 ? state.board[ROWS[ci + 1] + c] : null;
                      const down = c < d.to ? state.board[r + (c + 1)] : null;
                      const diag = ci < ROWS.length - 1 && c < d.to ? state.board[ROWS[ci + 1] + (c + 1)] : null;
                      const left = ci > 0 ? state.board[ROWS[ci - 1] + c] : null;
                      const up = c > d.from ? state.board[r + (c - 1)] : null;
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
                          joinRight={!!co && right === co}
                          joinDown={!!co && down === co}
                          joinCorner={!!co && right === co && down === co && diag === co}
                          joinLeft={!!co && left === co}
                          joinUp={!!co && up === co}
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

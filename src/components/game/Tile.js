// One plot on the city map. Colour changes animate after `delay` ms so buyouts flood outward.
import { memo, useLayoutEffect, useRef } from 'react';
import { Animated, Pressable, View } from 'react-native';
import Svg, { Line } from 'react-native-svg';
import { useTheme } from '../../theme/theme';
import { T } from '../../theme/ui';
import { companyGlyph } from '../CompanyIcon';

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
      accessibilityLabel={`Plot ${id}`}
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

export default memo(Tile);

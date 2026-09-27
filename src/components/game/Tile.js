// One plot on the city map. Colour changes animate after `delay` ms so buyouts flood outward.
import { memo, useLayoutEffect, useRef } from 'react';
import { Animated, Pressable, View } from 'react-native';
import Svg, { Line } from 'react-native-svg';
import { useTheme } from '../../theme/theme';
import { T } from '../../theme/ui';
import Silhouette from './Silhouette';

function Hatch({ px, color }) {
  const lines = [];
  for (let i = -px; i < px; i += 6) {
    lines.push(<Line key={i} x1={i} y1={px} x2={i + px} y2={0} stroke={color} strokeWidth={1} opacity={0.55} />);
  }
  return (
    <Svg width={px} height={px} style={{ position: 'absolute', left: 0, top: 0 }}>
      {lines}
    </Svg>
  );
}

function Tile({
  id, px, owner, companySize, district, mine, selected, trust, last, delay, onPress,
}) {
  const th = useTheme();
  const d = th.districts[district];
  const co = owner && owner !== 'x' ? th.companies[owner] : null;

  let fill = th.paper;
  if (selected) fill = th.ink;
  else if (co) fill = co.fill;
  else if (owner === 'x' || mine) fill = d.tint;

  // Animate between the previous and new fill.
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

  const showLabel = !co && px >= 24;
  const labelColor = selected ? th.onInk : mine ? th.ink : owner === 'x' ? d.accent : th.rule;

  return (
    <Pressable
      onPress={onPress ? () => onPress(id) : undefined}
      disabled={!onPress}
      accessibilityLabel={`Plot ${id}`}
      style={{ width: px, height: px }}
    >
      <View style={{ width: px, height: px, backgroundColor: fromFill.current, overflow: 'hidden' }}>
        <Animated.View style={{ position: 'absolute', left: 0, top: 0, width: px, height: px, backgroundColor: fill, opacity: anim }} />
        {owner === 'x' && !selected && <Hatch px={px} color={d.accent} />}
        {co && (
          <Animated.View style={{ position: 'absolute', left: 0, top: 0, opacity: anim }}>
            <Silhouette company={owner} color={co.ink} size={companySize} px={px} />
          </Animated.View>
        )}
        {showLabel && (
          <View style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }}>
            <T v="small" color={labelColor} style={{ fontSize: Math.max(8, Math.min(11, px / 3.4)) }}>{id}</T>
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

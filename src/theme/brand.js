// Iron & Gold brand pieces: iron plates with rivets, gold leaf, ingots, rail-track rules, the wordmark.
import { View } from 'react-native';
import Svg, {
  Defs, Line, LinearGradient, Pattern, Polygon, Rect, Stop,
} from 'react-native-svg';
import { useTheme } from './theme';
import { FONTS } from './tokens';
import { T } from './text';

const FILL = { position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 };

// Brushed iron: a vertical gradient with fine horizontal grain.
export function IronFill() {
  const { iron } = useTheme();
  return (
    <Svg style={FILL} width="100%" height="100%" preserveAspectRatio="none">
      <Defs>
        <LinearGradient id="ig-iron" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={iron.hi} />
          <Stop offset="0.45" stopColor={iron.mid} />
          <Stop offset="1" stopColor={iron.lo} />
        </LinearGradient>
        <Pattern id="ig-grain" width="6" height="3" patternUnits="userSpaceOnUse">
          <Rect x="0" y="0" width="6" height="1" fill="#FFFFFF" opacity="0.05" />
        </Pattern>
      </Defs>
      <Rect x="0" y="0" width="100%" height="100%" fill="url(#ig-iron)" />
      <Rect x="0" y="0" width="100%" height="100%" fill="url(#ig-grain)" />
    </Svg>
  );
}

// Gold leaf: bright top edge, warm middle, burnished bottom.
export function GoldFill() {
  const { goldLeaf: g } = useTheme();
  return (
    <Svg style={FILL} width="100%" height="100%" preserveAspectRatio="none">
      <Defs>
        <LinearGradient id="ig-gold" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={g.hi} />
          <Stop offset="0.5" stopColor={g.mid} />
          <Stop offset="1" stopColor={g.lo} />
        </LinearGradient>
      </Defs>
      <Rect x="0" y="0" width="100%" height="100%" fill="url(#ig-gold)" />
    </Svg>
  );
}

function Rivet({ size, style }) {
  const { iron } = useTheme();
  return (
    <View
      style={[{
        position: 'absolute', width: size, height: size, borderRadius: size / 2,
        backgroundColor: iron.rivet, borderWidth: 1, borderColor: iron.lo,
      }, style]}
    >
      <View style={{ position: 'absolute', left: size * 0.2, top: size * 0.15, width: size * 0.35, height: size * 0.3, borderRadius: size, backgroundColor: '#FFFFFF', opacity: 0.6 }} />
    </View>
  );
}

// Four rivets, one in each corner. `inset` is measured from the padding box.
export function Rivets({ size = 5, inset = 3 }) {
  return (
    <>
      <Rivet size={size} style={{ left: inset, top: inset }} />
      <Rivet size={size} style={{ right: inset, top: inset }} />
      <Rivet size={size} style={{ left: inset, bottom: inset }} />
      <Rivet size={size} style={{ right: inset, bottom: inset }} />
    </>
  );
}

// A gold ingot with engraved numerals — for headline money.
export function Ingot({ amount, size = 16, style }) {
  const { goldLeaf: g } = useTheme();
  return (
    <View style={[{ paddingHorizontal: size * 0.75, paddingVertical: size * 0.18, alignSelf: 'flex-start' }, style]}>
      <Svg style={FILL} width="100%" height="100%" viewBox="0 0 100 30" preserveAspectRatio="none">
        <Defs>
          <LinearGradient id="ig-ingot" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={g.hi} />
            <Stop offset="0.55" stopColor={g.mid} />
            <Stop offset="1" stopColor={g.lo} />
          </LinearGradient>
        </Defs>
        <Polygon points="7,0 93,0 100,30 0,30" fill="url(#ig-ingot)" stroke={g.lo} strokeWidth="1" />
        <Polygon points="7,0 93,0 91,5 9,5" fill={g.hi} opacity="0.8" />
      </Svg>
      <T
        style={{
          fontFamily: FONTS.money, fontSize: size, color: g.ink, letterSpacing: 0.5,
          textShadowColor: g.emboss, textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 0,
        }}
      >
        ${amount.toLocaleString('en-US')}
      </T>
    </View>
  );
}

// Rail track: two steel rails spiked onto heavy wooden ties. Used as the section divider.
export function RailRule({ style }) {
  const th = useTheme();
  const wood = th.dark ? '#6A5238' : '#7A5C3A';
  const woodLo = th.dark ? '#3E2F20' : '#4E3A24';
  const rail = th.dark ? '#9398A0' : th.iron.mid;
  return (
    <View style={[{ height: 16 }, style]}>
      <Svg width="100%" height="16">
        <Defs>
          <Pattern id="ig-ties" width="13" height="16" patternUnits="userSpaceOnUse">
            <Rect x="3" y="0.5" width="6.5" height="15" fill={wood} />
            <Rect x="3" y="13.5" width="6.5" height="2" fill={woodLo} />
            <Rect x="4" y="2.2" width="1.4" height="1.4" fill="#1D1E21" />
            <Rect x="7.2" y="2.2" width="1.4" height="1.4" fill="#1D1E21" />
            <Rect x="4" y="12.2" width="1.4" height="1.4" fill="#1D1E21" />
            <Rect x="7.2" y="12.2" width="1.4" height="1.4" fill="#1D1E21" />
          </Pattern>
        </Defs>
        <Rect x="0" y="0" width="100%" height="16" fill="url(#ig-ties)" />
        <Rect x="0" y="3.5" width="100%" height="3.5" fill={rail} />
        <Rect x="0" y="3.5" width="100%" height="1" fill={th.iron.hi} opacity="0.9" />
        <Rect x="0" y="9" width="100%" height="3.5" fill={rail} />
        <Rect x="0" y="9" width="100%" height="1" fill={th.iron.hi} opacity="0.9" />
        <Line x1="0" y1="7" x2="100%" y2="7" stroke={th.iron.lo} strokeWidth="0.8" />
        <Line x1="0" y1="12.5" x2="100%" y2="12.5" stroke={th.iron.lo} strokeWidth="0.8" />
      </Svg>
    </View>
  );
}

// "IRON & GOLD": iron letters, a gilt ampersand, gold-leaf GOLD.
export function Wordmark({ size = 20, align = 'left' }) {
  const th = useTheme();
  const base = { fontFamily: FONTS.display, fontSize: size };
  return (
    <T style={[base, { textAlign: align, color: th.dark ? th.iron.rivet : th.iron.mid }]}>
      Iron
      <T style={[base, { fontFamily: FONTS.accent, color: th.gilt }]}>{' & '}</T>
      <T
        style={[base, {
          color: th.gilt, textShadowColor: th.moneyShadow, textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 0,
        }]}
      >
        Gold
      </T>
    </T>
  );
}

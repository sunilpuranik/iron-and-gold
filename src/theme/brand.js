// Iron & Gold brand pieces: plates of lacquer, iron, gold leaf or bond paper; rules; seals; the wordmark.
import { useState } from 'react';
import { View } from 'react-native';
import Svg, {
  Circle, Defs, Line, LinearGradient, Pattern, RadialGradient, Rect, Stop,
} from 'react-native-svg';
import { useTheme } from './theme';
import {
  FONTS, GOLD, KEYLINE, mix,
} from './tokens';
import { T } from './text';

const FILL = { position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 };
const GOLD_OFFSETS = ['0', '0.18', '0.5', '1'];

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

// Gold leaf: shine at the top edge, leaf through the middle, deep at the foot.
export function GoldFill() {
  return (
    <Svg style={FILL} width="100%" height="100%" preserveAspectRatio="none">
      <Defs>
        <LinearGradient id="ig-gold" x1="0" y1="0" x2="0" y2="1">
          {GOLD.stops.map((c, i) => <Stop key={c} offset={GOLD_OFFSETS[i]} stopColor={c} />)}
        </LinearGradient>
      </Defs>
      <Rect x="0" y="0" width="100%" height="100%" fill="url(#ig-gold)" />
    </Svg>
  );
}

// Inset engraved keyline.
export function Keyline({ color = KEYLINE.color, inset = KEYLINE.inset }) {
  return (
    <View
      style={{
        position: 'absolute', top: inset, left: inset, right: inset, bottom: inset, borderWidth: 1, borderColor: color, pointerEvents: 'none',
      }}
    />
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

// The one surface primitive. Every plate carries a gilt keyline; iron may carry rivets.
//   lacquer — raised black panel (the default)
//   iron    — brushed iron, structure and secondary controls
//   gold    — gold leaf, wealth moments only
//   bond    — cream paper, documents only
export function Plate({
  material = 'lacquer', rivets, pad = 16, style, children, ...rest
}) {
  const th = useTheme();
  const look = {
    lacquer: { backgroundColor: th.plate, borderColor: th.rule, keyline: KEYLINE.color },
    iron: { backgroundColor: th.iron.mid, borderColor: th.iron.edge, keyline: 'rgba(207,166,74,0.5)' },
    gold: { backgroundColor: GOLD.leaf, borderColor: GOLD.edge, keyline: 'rgba(58,42,14,0.45)' },
    bond: { backgroundColor: th.bond.paper, borderColor: th.bond.rule, keyline: 'rgba(156,116,36,0.5)' },
  }[material];
  return (
    <View
      {...rest}
      style={[{
        backgroundColor: look.backgroundColor, borderWidth: 1, borderColor: look.borderColor, padding: pad, overflow: 'hidden',
      }, style]}
    >
      {material === 'iron' && <IronFill />}
      {material === 'gold' && <GoldFill />}
      <Keyline color={look.keyline} />
      {rivets && <Rivets size={6} inset={8} />}
      {children}
    </View>
  );
}

// Rail track: two steel rails spiked onto heavy wooden ties. Kept for the map.
function RailTrack({ style }) {
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

// A gold hairline that fades out towards `from` ('left' or 'right').
function FadeLine({ from, id }) {
  const th = useTheme();
  return (
    <Svg style={{ flex: 1 }} height="1">
      <Defs>
        <LinearGradient id={id} x1={from === 'left' ? '0' : '1'} y1="0" x2={from === 'left' ? '1' : '0'} y2="0">
          <Stop offset="0" stopColor={th.accent} stopOpacity="0" />
          <Stop offset="1" stopColor={th.accent} stopOpacity="1" />
        </LinearGradient>
      </Defs>
      <Rect x="0" y="0" width="100%" height="1" fill={`url(#${id})`} />
    </Svg>
  );
}

// Dividers. hair between rows · gilt under section titles · ornament for set pieces · rail on the map only.
export function Rule({ kind = 'hair', style }) {
  const th = useTheme();
  if (kind === 'rail') return <RailTrack style={style} />;
  if (kind === 'gilt') {
    return (
      <View style={[{ gap: 3 }, style]}>
        <View style={{ height: 2, backgroundColor: th.accent }} />
        <View style={{ height: 1, backgroundColor: th.accent, opacity: 0.5 }} />
      </View>
    );
  }
  if (kind === 'ornament') {
    return (
      <View style={[{ flexDirection: 'row', alignItems: 'center', gap: 10, height: 12 }, style]}>
        <FadeLine from="left" id="ig-orn-l" />
        <View style={{ width: 7, height: 7, backgroundColor: th.accent, transform: [{ rotate: '45deg' }] }} />
        <FadeLine from="right" id="ig-orn-r" />
      </View>
    );
  }
  return <View style={[{ height: 1, backgroundColor: th.rule }, style]} />;
}

function NotarySeal({ size, label }) {
  const emboss = { textShadowColor: GOLD.emboss, textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 0 };
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Defs>
          <RadialGradient id="ig-notary" cx="0.38" cy="0.3" r="0.75">
            <Stop offset="0" stopColor={GOLD.shine} />
            <Stop offset="0.35" stopColor={GOLD.bright} />
            <Stop offset="0.6" stopColor={GOLD.leaf} />
            <Stop offset="0.95" stopColor={GOLD.deep} />
          </RadialGradient>
        </Defs>
        <Circle cx="50" cy="50" r="49" fill="url(#ig-notary)" stroke={GOLD.burnish} strokeWidth="1" />
        <Circle cx="50" cy="50" r="44" fill="none" stroke={GOLD.deep} strokeWidth="4" />
        <Circle cx="50" cy="50" r="40" fill="none" stroke={GOLD.shine} strokeWidth="3" opacity="0.9" />
        <Circle cx="50" cy="50" r="31" fill="none" stroke={GOLD.deep} strokeWidth="0.8" strokeDasharray="2 2" />
      </Svg>
      <View style={{ ...FILL, alignItems: 'center', justifyContent: 'center' }}>
        <T style={[{ fontFamily: FONTS.money, fontSize: size * 0.22, color: GOLD.ink, letterSpacing: 1 }, emboss]}>{label}</T>
      </View>
    </View>
  );
}

// The Iron & Gold coin: struck gold, triple rim, "IG" over the founding year.
function CoinSeal({ size, label = 'IG' }) {
  const emboss = { textShadowColor: GOLD.emboss, textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 0 };
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Defs>
          <RadialGradient id="ig-coin" cx="0.38" cy="0.3" r="0.72">
            <Stop offset="0" stopColor={GOLD.shine} />
            <Stop offset="0.3" stopColor={GOLD.bright} />
            <Stop offset="0.55" stopColor={GOLD.leaf} />
            <Stop offset="0.9" stopColor={GOLD.deep} />
          </RadialGradient>
        </Defs>
        <Circle cx="50" cy="50" r="49" fill="url(#ig-coin)" stroke={GOLD.burnish} strokeWidth="1" />
        <Circle cx="50" cy="50" r="45" fill="none" stroke={GOLD.deep} strokeWidth="3" />
        <Circle cx="50" cy="50" r="42.5" fill="none" stroke={GOLD.shine} strokeWidth="1.6" opacity="0.9" />
        <Circle cx="50" cy="50" r="40.5" fill="none" stroke={GOLD.deep} strokeWidth="1.6" />
      </Svg>
      <View style={{ ...FILL, alignItems: 'center', justifyContent: 'center' }}>
        <T style={[{ fontFamily: FONTS.display, fontSize: size * 0.32, lineHeight: size * 0.36, color: GOLD.ink }, emboss]}>{label}</T>
        <T style={[{ fontFamily: FONTS.engraved, fontSize: Math.max(6, size * 0.095), letterSpacing: size * 0.024, color: GOLD.ink }, emboss]}>1881</T>
      </View>
    </View>
  );
}

// Gold seals. notary = the company stamp on certificates · coin = the Iron & Gold emblem.
export function Seal({ kind = 'notary', size = 58, label }) {
  return kind === 'coin' ? <CoinSeal size={size} label={label} /> : <NotarySeal size={size} label={label} />;
}

// Gold-leaf lettering: the same line of text struck in horizontal bands, shine at the top to deep at the foot.
// Pure layout, so it lines up exactly with neighbouring text on every platform.
const LEAF_BANDS = 8;
function leafAt(t) {
  const at = [0, 0.18, 0.5, 1];
  let i = 0;
  while (i < at.length - 2 && t > at[i + 1]) i++;
  return mix(GOLD.stops[i], GOLD.stops[i + 1], (t - at[i]) / (at[i + 1] - at[i]));
}

export function GildText({ children, style, ...rest }) {
  const [h, setH] = useState(0);
  const band = h / LEAF_BANDS;
  return (
    <View onLayout={(e) => setH(e.nativeEvent.layout.height)}>
      <T {...rest} style={[style, { color: GOLD.deep }]}>{children}</T>
      {h > 0 && Array.from({ length: LEAF_BANDS }, (_, i) => (
        <View key={i} style={{ position: 'absolute', left: 0, right: -4, top: i * band, height: band + 0.5, overflow: 'hidden' }}>
          <T {...rest} style={[style, { position: 'absolute', left: 0, top: -i * band, color: leafAt((i + 0.5) / LEAF_BANDS) }]}>
            {children}
          </T>
        </View>
      ))}
    </View>
  );
}

// "IRON & GOLD", all Cinzel: IRON in rivet grey, a gilt italic ampersand, GOLD in gold leaf.
export function Wordmark({ size = 20, align = 'left' }) {
  const th = useTheme();
  const base = { fontFamily: FONTS.display, fontSize: size, lineHeight: Math.round(size * 1.2), letterSpacing: size * 0.04 };
  const justify = { left: 'flex-start', center: 'center', right: 'flex-end' }[align];
  return (
    <View accessible accessibilityLabel="Iron & Gold" style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: justify }}>
      <T style={base} color={th.dark ? th.iron.rivet : th.iron.mid}>IRON</T>
      <T style={[base, { fontFamily: FONTS.accent, letterSpacing: 0 }]} color={th.accent}>{' & '}</T>
      <GildText style={base}>GOLD</GildText>
    </View>
  );
}

// v1 names, kept until the cleanup pass.
export const RailRule = ({ style }) => <Rule kind="rail" style={style} />;

// The splash scene from the "Splash — Gold Rush" design: dusk over the frontier, a sunburst behind
// the mesas, saguaros, a rolling rail line with a train and riders crossing, and gold coins falling.
// Everything moves on Animated loops; with Reduce Motion on, the scene holds still.
import { useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo, Animated, Easing, Platform, View,
} from 'react-native';
import Svg, {
  Circle, Defs, G, LinearGradient, Path, Polygon, RadialGradient, Rect, Stop,
} from 'react-native-svg';
import { T } from '../../theme/ui';
import { Seal, Wordmark } from '../../theme/brand';
import { FONTS, GOLD } from '../../theme/tokens';

const NATIVE = Platform.OS !== 'web';
const SKY = ['#0B0907', '#1B1210', '#3A1C12', '#7A3413', '#C0701F', '#E4A548'];
const SKY_AT = [0, 0.22, 0.48, 0.7, 0.88, 1];
const SILHOUETTE = '#0B0604';
const RAIL_H = 52;
const TIE = 40; // tie spacing; the tie strip scrolls one spacing per loop

// Horse and rider, facing right (drawn in a 120×94 box with the rider's hat poking above).
const HORSE = 'M28 34C28 27 40 25 56 26C72 25 84 27 86 35C86 44 78 49 70 49L38 49C30 49 28 42 28 34Z'
  + 'M76 34L90 12L98 6L108 10L113 21L107 24L101 19L94 36Z M94 10L96 2L99 8Z M30 33C16 35 11 47 14 60C20 49 25 43 32 41Z';
const LEGS = 'M78 46L82 62L78 76M85 46L92 60L94 74M34 44L28 60L30 76M42 46L47 62L45 76';
const RIDER = 'M50 28L53 6L63 6L66 28Z';

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled?.().then(setReduced).catch(() => {});
    const sub = AccessibilityInfo.addEventListener?.('reduceMotionChanged', setReduced);
    return () => sub?.remove?.();
  }, []);
  return reduced;
}

// A 0→1 value that loops forever (or sits at `rest` when motion is reduced).
function useLoop(duration, { delay = 0, still, rest = 0.5, ease = Easing.linear } = {}) {
  const v = useRef(new Animated.Value(still ? rest : 0)).current;
  useEffect(() => {
    if (still) { v.setValue(rest); return undefined; }
    // A negative delay starts the loop part-way through, so the scene opens already in motion.
    const offset = ((-delay % duration) + duration) % duration / duration;
    v.setValue(offset);
    const first = Animated.timing(v, {
      toValue: 1, duration: duration * (1 - offset), easing: ease, useNativeDriver: NATIVE,
    });
    const loop = Animated.loop(Animated.timing(v, {
      toValue: 1, duration, easing: ease, useNativeDriver: NATIVE,
    }), { resetBeforeIteration: true });
    let stopped = false;
    first.start(({ finished }) => {
      if (finished && !stopped) { v.setValue(0); loop.start(); }
    });
    return () => { stopped = true; first.stop(); loop.stop(); };
  }, [still, duration]);
  return v;
}

function Rider({ size, width, y, duration, delay, still, hat = true }) {
  const t = useLoop(duration, { delay, still, rest: 0.35 });
  const bob = useLoop(500, { still, ease: Easing.inOut(Easing.sin) });
  const x = t.interpolate({ inputRange: [0, 1], outputRange: [-size - 40, width + 40] });
  const dy = bob.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, -3, 0] });
  return (
    <Animated.View pointerEvents="none" style={{ position: 'absolute', left: 0, bottom: y, transform: [{ translateX: x }, { translateY: dy }] }}>
      <Svg width={size} height={size * 0.78} viewBox="0 -14 120 94">
        <Path d={HORSE} fill={SILHOUETTE} />
        <Path d={LEGS} stroke={SILHOUETTE} strokeWidth="4" strokeLinecap="round" fill="none" />
        {hat && (
          <G fill={SILHOUETTE}>
            <Path d={RIDER} />
            <Circle cx="58" cy="0" r="5" />
            <Rect x="47" y="-5.5" width="22" height="5" rx="2.5" />
            <Rect x="53" y="-11" width="10" height="8" rx="3" />
            <Path d="M62 12L84 24" stroke={SILHOUETTE} strokeWidth="3" strokeLinecap="round" />
          </G>
        )}
      </Svg>
    </Animated.View>
  );
}

function Train({ width, still }) {
  const t = useLoop(42000, { still, rest: 0.3 });
  const x = t.interpolate({ inputRange: [0, 1], outputRange: [-230, width + 30] });
  return (
    <Animated.View pointerEvents="none" style={{ position: 'absolute', left: 0, bottom: RAIL_H + 40, transform: [{ translateX: x }] }}>
      <Svg width={210} height={45} viewBox="0 0 300 64" fill={SILHOUETTE}>
        <Rect x="0" y="24" width="44" height="22" />
        <Rect x="50" y="24" width="44" height="22" />
        <Rect x="100" y="28" width="46" height="18" />
        <Rect x="150" y="14" width="46" height="32" />
        <Rect x="146" y="10" width="54" height="5" />
        <Rect x="196" y="24" width="64" height="20" rx="8" />
        <Path d="M244 24L248 8L268 8L272 24Z M244 8h28v3h-28z M258 46L286 54L258 54Z" />
        <Circle cx="225" cy="22" r="7" />
        {[20, 70, 120, 238].map((cx) => <Circle key={cx} cx={cx} cy="52" r="6" />)}
        <Circle cx="172" cy="50" r="9" />
        <Circle cx="206" cy="50" r="9" />
        <Rect x="0" y="58" width="300" height="3" />
      </Svg>
    </Animated.View>
  );
}

function Coin({ left, size, duration, delay, height, still }) {
  const t = useLoop(duration, { delay, still, rest: 0.3 });
  if (still) return null;
  const y = t.interpolate({ inputRange: [0, 1], outputRange: [-size - 10, height * 0.62] });
  const opacity = t.interpolate({ inputRange: [0, 0.1, 0.8, 1], outputRange: [0, 1, 0.6, 0] });
  const spin = t.interpolate({ inputRange: [0, 0.25, 0.5, 0.75, 1], outputRange: [1, 0.15, 1, 0.15, 1] });
  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute', top: 0, left: `${left}%`, width: size, height: size, opacity,
        transform: [{ translateY: y }, { scaleX: spin }],
      }}
    >
      <Svg width={size} height={size} viewBox="0 0 20 20">
        <Defs>
          <RadialGradient id="coin" cx="35%" cy="30%" r="70%">
            <Stop offset="0" stopColor={GOLD.shine} />
            <Stop offset="0.55" stopColor={GOLD.leaf} />
            <Stop offset="1" stopColor="#7A5718" />
          </RadialGradient>
        </Defs>
        <Circle cx="10" cy="10" r="9.5" fill="url(#coin)" stroke={GOLD.edge} strokeWidth="1" />
      </Svg>
    </Animated.View>
  );
}

function RailLine({ width, still }) {
  const t = useLoop(5000, { still, rest: 0 });
  const x = t.interpolate({ inputRange: [0, 1], outputRange: [0, -TIE] });
  const ties = Math.ceil(width / TIE) + 2;
  const rail = (top) => (
    <View style={{ position: 'absolute', left: 0, right: 0, top, height: 5 }}>
      <Svg width="100%" height="5">
        <Defs>
          <LinearGradient id="steel" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#A3A8B2" />
            <Stop offset="1" stopColor="#4B4F58" />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="5" fill="url(#steel)" />
      </Svg>
    </View>
  );
  return (
    <View style={{
      position: 'absolute', left: 0, right: 0, bottom: 0, height: RAIL_H, overflow: 'hidden',
      backgroundColor: '#0B0907', borderTopWidth: 2, borderColor: GOLD.edge,
    }}
    >
      <Animated.View style={{ position: 'absolute', top: 0, bottom: 0, left: 0, flexDirection: 'row', transform: [{ translateX: x }] }}>
        {Array.from({ length: ties }, (_, i) => (
          <View key={i} style={{ width: 14, marginRight: TIE - 14, height: '100%', backgroundColor: '#3A2412', opacity: 0.9 }} />
        ))}
      </Animated.View>
      {rail(9)}
      {rail(34)}
    </View>
  );
}

// The static landscape, drawn to the scene's real size so nothing stretches.
function Landscape({ width: w, height: h }) {
  const ground = h - RAIL_H;
  const sun = Math.min(420, w * 0.7);
  const cx = w / 2;
  const cy = h - 52 - sun / 2; // the sun sits just above the rail line, as in the design
  const rays = Array.from({ length: 36 }, (_, i) => {
    const a = (i * 10 * Math.PI) / 180;
    const b = ((i * 10 + 4) * Math.PI) / 180;
    const r = Math.max(w, h) * 0.9;
    return `${cx},${cy} ${cx + r * Math.cos(a)},${cy + r * Math.sin(a)} ${cx + r * Math.cos(b)},${cy + r * Math.sin(b)}`;
  });
  const mesa = (x0, wd, ht, pts, fill) => (
    <Polygon fill={fill} points={pts.map(([px, py]) => `${x0 + px * wd},${ground - 18 - ht + py * ht}`).join(' ')} />
  );
  const cactus = (x, ht) => (
    <G fill={SILHOUETTE}>
      <Rect x={x} y={ground - ht} width={4} height={ht} />
      <Rect x={x - 22} y={ground - ht + 8} width={48} height={4} />
      <Rect x={x - 16} y={ground - ht + 24} width={36} height={3} />
    </G>
  );
  return (
    <Svg width={w} height={h} style={{ position: 'absolute', left: 0, top: 0 }}>
      <Defs>
        <LinearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          {SKY.map((c, i) => <Stop key={c} offset={SKY_AT[i]} stopColor={c} />)}
        </LinearGradient>
        <RadialGradient id="sun" cx="50%" cy="50%" r="50%">
          <Stop offset="0" stopColor="#FFF1B8" />
          <Stop offset="0.48" stopColor="#F3C25A" />
          <Stop offset="0.8" stopColor="#E4A548" stopOpacity="0.35" />
          <Stop offset="1" stopColor="#E4A548" stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id="rayfade" cx={cx} cy={cy} r={Math.max(w, h) * 0.6} gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#FFD678" stopOpacity="0.14" />
          <Stop offset="1" stopColor="#FFD678" stopOpacity="0" />
        </RadialGradient>
        <LinearGradient id="foot" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#1B0E09" />
          <Stop offset="1" stopColor="#0B0907" />
        </LinearGradient>
      </Defs>
      <Rect width={w} height={h} fill="url(#sky)" />
      {[[0.12, 0.14], [0.28, 0.3], [0.71, 0.12], [0.86, 0.26], [0.46, 0.08], [0.94, 0.08], [0.05, 0.36]].map(([x, y]) => (
        <Circle key={`${x}${y}`} cx={x * w} cy={y * h} r={1.1} fill={GOLD.shine} />
      ))}
      <G fill="url(#rayfade)">{rays.map((p) => <Polygon key={p} points={p} />)}</G>
      <Circle cx={cx} cy={cy} r={sun / 2} fill="url(#sun)" />
      {mesa(-0.02 * w, 0.44 * w, 170, [[0, 1], [0, 0.46], [0.08, 0.42], [0.1, 0.2], [0.32, 0.18], [0.34, 0.4], [0.48, 0.44], [0.54, 0.62], [0.76, 0.66], [0.84, 1]], '#3A1A10')}
      {mesa(0.56 * w, 0.46 * w, 210, [[0, 1], [0.1, 0.58], [0.18, 0.54], [0.22, 0.3], [0.4, 0.26], [0.44, 0.5], [0.58, 0.52], [0.64, 0.12], [0.86, 0.08], [0.9, 0.46], [1, 0.5], [1, 1]], '#331710')}
      <Rect x={0} y={ground - 68} width={w} height={68 + RAIL_H} fill="url(#foot)" />
      <Polygon
        fill="#120A07"
        points={[[0, 0.6], [0.06, 0.4], [0.14, 0.55], [0.24, 0.3], [0.33, 0.5], [0.44, 0.34], [0.55, 0.56], [0.66, 0.36], [0.78, 0.52], [0.9, 0.3], [1, 0.48], [1, 1], [0, 1]]
          .map(([x, y]) => `${x * w},${ground - 34 + y * 34}`).join(' ')}
      />
      {cactus(0.05 * w, 230)}
      {cactus(w - 0.06 * w - 4, 190)}
    </Svg>
  );
}

const COINS = Array.from({ length: 9 }, (_, i) => ({
  left: 8 + i * 10.5, duration: (3.5 + (i % 4)) * 1000, delay: -i * 1300, size: 14 + (i % 3) * 5,
}));

export default function FrontierScene({ width, height, topInset = 0 }) {
  const still = useReducedMotion();
  const rise = useRef(new Animated.Value(still ? 1 : 0)).current;
  const glow = useLoop(6000, { still, rest: 0.5, ease: Easing.inOut(Easing.sin) });
  useEffect(() => {
    Animated.timing(rise, {
      toValue: 1, duration: 900, easing: Easing.out(Easing.cubic), useNativeDriver: NATIVE,
    }).start();
  }, []);
  const sun = Math.min(420, width * 0.7);
  const glowScale = glow.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 1.06, 1] });
  const glowOpacity = glow.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.0, 0.35, 0.0] });
  const wordSize = Math.max(34, Math.min(96, width * 0.105));

  return (
    <View style={{ width, height, overflow: 'hidden', backgroundColor: SKY[0] }}>
      <Landscape width={width} height={height} />
      <Animated.View
        pointerEvents="none"
        style={{
          position: 'absolute', left: (width - sun) / 2, top: height - 52 - sun, width: sun, height: sun,
          opacity: glowOpacity, transform: [{ scale: glowScale }],
        }}
      >
        <Svg width={sun} height={sun}>
          <Defs>
            <RadialGradient id="halo" cx="50%" cy="50%" r="50%">
              <Stop offset="0" stopColor="#FFF1B8" stopOpacity="0.9" />
              <Stop offset="1" stopColor="#F3C25A" stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <Circle cx={sun / 2} cy={sun / 2} r={sun / 2} fill="url(#halo)" />
        </Svg>
      </Animated.View>
      <Train width={width} still={still} />
      <Rider size={108} width={width} y={RAIL_H + 14} duration={30000} delay={0} still={still} />
      <Rider size={90} width={width} y={RAIL_H + 12} duration={30000} delay={-1400} still={still} />
      <Rider size={96} width={width} y={RAIL_H + 14} duration={30000} delay={-2600} still={still} hat={false} />
      <Rider size={72} width={width} y={RAIL_H + 28} duration={44000} delay={-14000} still={still} />
      <RailLine width={width} still={still} />
      {COINS.map((c) => <Coin key={c.left} {...c} height={height} still={still} />)}

      <Animated.View
        style={{
          position: 'absolute', left: 0, right: 0, top: 0, paddingTop: 28 + topInset, paddingHorizontal: 20, alignItems: 'center', gap: 6,
          opacity: rise, transform: [{ translateY: rise.interpolate({ inputRange: [0, 1], outputRange: [18, 0] }) }],
        }}
      >
        <View style={{ borderRadius: 60, shadowColor: GOLD.bright, shadowOpacity: 0.55, shadowRadius: 28, shadowOffset: { width: 0, height: 0 } }}>
          <Seal kind="coin" size={width < 500 ? 88 : 104} />
        </View>
        <View style={{ marginTop: 6 }}>
          <Wordmark size={wordSize} align="center" />
        </View>
        <T
          style={{
            fontFamily: FONTS.accent, fontSize: Math.max(18, Math.min(26, width * 0.026 + 8)), textAlign: 'center',
            textShadowColor: 'rgba(0,0,0,0.7)', textShadowRadius: 8, textShadowOffset: { width: 0, height: 2 },
          }}
          color="#F3E2B4"
        >
          Stake a claim. Lay the rails. Take the whole town.
        </T>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 8 }}>
          <Svg width={90} height={1}><Defs><LinearGradient id="l" x1="0" y1="0" x2="1" y2="0"><Stop offset="0" stopColor={GOLD.leaf} stopOpacity="0" /><Stop offset="1" stopColor={GOLD.leaf} /></LinearGradient></Defs><Rect width="90" height="1" fill="url(#l)" /></Svg>
          <View style={{ width: 9, height: 9, backgroundColor: GOLD.leaf, transform: [{ rotate: '45deg' }] }} />
          <Svg width={90} height={1}><Defs><LinearGradient id="r" x1="1" y1="0" x2="0" y2="0"><Stop offset="0" stopColor={GOLD.leaf} stopOpacity="0" /><Stop offset="1" stopColor={GOLD.leaf} /></LinearGradient></Defs><Rect width="90" height="1" fill="url(#r)" /></Svg>
        </View>
        <T
          style={{
            fontFamily: FONTS.engraved, fontSize: 12, letterSpacing: 5, marginTop: 2, textAlign: 'center',
            textShadowColor: '#000', textShadowRadius: 6, textShadowOffset: { width: 0, height: 1 },
          }}
          color="#F7E7A6"
        >
          A FRONTIER RAIL TOWN · 1881
        </T>
      </Animated.View>
    </View>
  );
}

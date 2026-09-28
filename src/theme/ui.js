// Shared primitives: text, money, rules, plates, gold / iron / ghost buttons, steppers.
import { Pressable, View } from 'react-native';
import { Minus, Plus } from 'lucide-react-native';
import Svg, {
  Defs, LinearGradient, Polygon, Stop,
} from 'react-native-svg';
import { useTheme } from './theme';
import { FONTS, GOLD, MIN_TARGET } from './tokens';
import { T } from './text';
import {
  GoldFill, IronFill, Keyline, Plate, Rule,
} from './brand';
import { feel } from '../feel/feel';

export { T, Plate, Rule };

const MONEY_SIZE = { small: 11, body: 14, title: 18 };

function dollars(amount, delta) {
  const s = `$${Math.abs(amount).toLocaleString('en-US')}`;
  if (amount < 0) return `−${s}`;
  return delta && amount > 0 ? `+${s}` : s;
}

// A gold ingot with engraved numerals — for headline cash only (your wallet, winnings).
function Ingot({ text, size, style }) {
  return (
    <View style={[{ paddingHorizontal: size * 0.75, paddingVertical: size * 0.18, alignSelf: 'flex-start' }, style]}>
      <Svg style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 }} width="100%" height="100%" viewBox="0 0 100 30" preserveAspectRatio="none">
        <Defs>
          <LinearGradient id="ig-ingot" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={GOLD.shine} />
            <Stop offset="0.2" stopColor={GOLD.bright} />
            <Stop offset="0.55" stopColor={GOLD.leaf} />
            <Stop offset="1" stopColor={GOLD.deep} />
          </LinearGradient>
        </Defs>
        <Polygon points="7,0 93,0 100,30 0,30" fill="url(#ig-ingot)" stroke={GOLD.deep} strokeWidth="1" />
        <Polygon points="7,0 93,0 91,5 9,5" fill={GOLD.shine} opacity="0.8" />
      </Svg>
      <T
        style={{
          fontFamily: FONTS.money, fontSize: size, color: GOLD.ink, letterSpacing: 0.5,
          textShadowColor: GOLD.emboss, textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 0,
        }}
      >
        {text}
      </T>
    </View>
  );
}

// Money in engraved capitals with lining numerals. v: ingot | title | body | small.
// `delta` signs the amount; losses are carnelian, never red.
export function Money({
  amount, v = 'body', delta, size, style,
}) {
  const th = useTheme();
  const text = dollars(amount, delta);
  if (v === 'ingot') return <Ingot text={text} size={size || 20} style={style} />;
  const loss = amount < 0;
  return (
    <T
      style={[{
        fontFamily: FONTS.money, fontSize: size || MONEY_SIZE[v] || 14, letterSpacing: 0.3,
        color: loss ? th.jewel.carnelianText : th.money,
        textShadowColor: th.dark ? '#000000' : GOLD.emboss, textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 0,
      }, style]}
    >
      {text}
    </T>
  );
}

const DEPTH = 4;
const LEGACY_KIND = { primary: 'gold', secondary: 'iron', tertiary: 'ghost' };
const GHOST_EDGE = 'rgba(207,166,74,0.55)';

// Actions.
//   gold  — the one primary action per screen: gold leaf standing on a 4px base
//   iron  — secondary: riveted iron plate on the same base
//   ghost — tertiary: a gilt outline; with iconOnly, a bare icon in a 44pt target
// Raised plates sink onto their base while pressed.
export function Button({
  title, onPress, kind = 'gold', disabled, icon: Icon, iconOnly, label, color, style, compact,
}) {
  const th = useTheme();
  const k = LEGACY_KIND[kind] || kind;
  const pad = compact ? 14 : 20;

  if (iconOnly) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label || title}
        accessibilityState={{ disabled: !!disabled }}
        onPress={disabled ? undefined : onPress}
        hitSlop={4}
        style={({ pressed }) => [{
          width: MIN_TARGET, height: MIN_TARGET, alignItems: 'center', justifyContent: 'center',
          opacity: disabled ? 0.3 : pressed ? 0.6 : 1,
        }, style]}
      >
        <Icon size={22} color={color || th.money} strokeWidth={1.5} />
      </Pressable>
    );
  }

  if (k === 'ghost') {
    const fg = color || th.money;
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: !!disabled }}
        onPress={disabled ? undefined : onPress}
        style={({ pressed }) => [{
          minHeight: MIN_TARGET + 4, paddingHorizontal: pad, borderWidth: 1, borderColor: th.dark ? GHOST_EDGE : th.accent,
          alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8,
          opacity: disabled ? 0.4 : pressed ? 0.7 : 1,
        }, style]}
      >
        {Icon && <Icon size={18} color={fg} strokeWidth={1.75} />}
        <T v="plate" color={fg} numberOfLines={1}>{title}</T>
      </Pressable>
    );
  }

  const iron = k === 'iron';
  const fg = iron ? th.iron.text : GOLD.ink;
  const edge = iron ? th.iron.edge : GOLD.edge;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      onPress={disabled ? undefined : onPress}
      style={[{ paddingBottom: DEPTH, opacity: disabled ? 0.45 : 1 }, style]}
    >
      {({ pressed }) => {
        const down = pressed && !disabled;
        return (
          <>
            <View
              style={{
                position: 'absolute', left: 0, right: 0, top: DEPTH, bottom: 0,
                backgroundColor: edge, borderWidth: 1, borderColor: edge,
              }}
            />
            <View
              style={{
                minHeight: MIN_TARGET + 6, paddingHorizontal: pad, borderWidth: 1, borderColor: edge,
                alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8, overflow: 'hidden',
                transform: [{ translateY: down ? DEPTH - 1 : 0 }],
              }}
            >
              {iron ? <IronFill /> : <GoldFill />}
              <View style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 1, backgroundColor: '#FFFAE1', opacity: iron ? 0.25 : 0.85 }} />
              <Keyline color={iron ? GHOST_EDGE : 'rgba(58,42,14,0.45)'} inset={5} />
              {Icon && (
                <View>
                  <Icon size={18} color={fg} strokeWidth={1.75} />
                </View>
              )}
              <T
                numberOfLines={1}
                style={{
                  fontFamily: FONTS.money, fontSize: compact ? 13 : 14, letterSpacing: compact ? 2.3 : 2.8, color: fg,
                  textTransform: 'uppercase',
                  textShadowColor: iron ? 'rgba(0,0,0,0.6)' : GOLD.emboss,
                  textShadowOffset: { width: 0, height: iron ? -1 : 1 },
                  textShadowRadius: 0,
                }}
              >
                {title}
              </T>
            </View>
          </>
        );
      }}
    </Pressable>
  );
}

export function Stepper({ value, onChange, min = 0, max, step = 1, label }) {
  const th = useTheme();
  const set = (n) => {
    if (n < min || n > max || n === value) return;
    feel.select();
    onChange(n);
  };
  const box = {
    width: MIN_TARGET, height: MIN_TARGET, borderWidth: 1, alignItems: 'center', justifyContent: 'center',
  };
  const canLess = value - step >= min;
  const canMore = value + step <= max;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }} accessibilityLabel={label}>
      <Pressable accessibilityLabel={`Less ${label || ''}`} onPress={() => set(value - step)} style={[box, { borderColor: th.field, opacity: canLess ? 1 : 0.35 }]}>
        <Minus size={18} color={th.inkSoft} strokeWidth={1.5} />
      </Pressable>
      <View style={{ minWidth: 32, alignItems: 'center' }}>
        <T style={{ fontFamily: FONTS.money, fontSize: 16 }} color={value ? th.ink : th.inkFaint}>{value}</T>
      </View>
      <Pressable accessibilityLabel={`More ${label || ''}`} onPress={() => set(value + step)} style={[box, { borderColor: th.accent, opacity: canMore ? 1 : 0.35 }]}>
        <Plus size={18} color={th.money} strokeWidth={1.5} />
      </Pressable>
    </View>
  );
}

export function Screen({ children, style }) {
  const th = useTheme();
  return <View style={[{ flex: 1, backgroundColor: th.ground }, style]}>{children}</View>;
}

// v1 names, kept until the cleanup pass.
export const Card = ({ children, style }) => <Plate rivets style={style}>{children}</Plate>;
export const DoubleRule = ({ style }) => <Rule kind="gilt" style={style} />;
export const Hairline = ({ style }) => <Rule style={style} />;
export const IconButton = (p) => <Button {...p} iconOnly />;
export { Keyline };
export const RailRule = ({ style }) => <Rule kind="rail" style={style} />;
export const LegacyIngot = ({ amount, size = 16, style }) => <Money amount={amount} v="ingot" size={size} style={style} />;
export { LegacyIngot as Ingot };

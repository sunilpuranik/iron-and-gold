// Shared primitives: text, money, rules, iron cards, iron and gold buttons, steppers.
import { Pressable, View } from 'react-native';
import { Minus, Plus } from 'lucide-react-native';
import { useTheme } from './theme';
import { FONTS, MIN_TARGET } from './tokens';
import { T } from './text';
import {
  GoldFill, Ingot, IronFill, RailRule, Rivets,
} from './brand';
import { feel } from '../feel/feel';

export { T, Ingot, RailRule };

const MONEY_SIZE = {
  small: 11, body: 14, strong: 14, title: 18, display: 22,
};

// Gold-leaf money: engraved capitals, lining numerals, a faint emboss.
export function Money({ amount, v = 'strong', style }) {
  const th = useTheme();
  return (
    <T
      style={[{
        fontFamily: FONTS.money, fontSize: MONEY_SIZE[v] || 14, color: th.gilt, letterSpacing: 0.3,
        textShadowColor: th.moneyShadow, textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 0,
      }, style]}
    >
      ${amount.toLocaleString('en-US')}
    </T>
  );
}

// Section divider. Drawn as a rail track: two iron rails on wooden ties.
export function DoubleRule({ style }) {
  return <RailRule style={style} />;
}

export function Hairline({ style }) {
  const th = useTheme();
  return <View style={[{ height: 1, backgroundColor: th.rule }, style]} />;
}

// Inset engraved keyline.
export function Keyline({ color, inset = 3 }) {
  return (
    <View
      style={{
        position: 'absolute', top: inset, left: inset, right: inset, bottom: inset, borderWidth: 1, borderColor: color, pointerEvents: 'none',
      }}
    />
  );
}

// Ledger card in a riveted iron frame with a gilt inner keyline.
export function Card({ children, style }) {
  const th = useTheme();
  return (
    <View style={[{ backgroundColor: th.ledger, borderWidth: 3, borderColor: th.iron.mid, padding: 16 }, style]}>
      <Keyline color={th.gilt} inset={4} />
      <Rivets size={6} inset={-4.5} />
      {children}
    </View>
  );
}

// kind: primary (riveted iron plate) | secondary (gold leaf) | tertiary (iron outline)
export function Button({
  title, onPress, kind = 'primary', disabled, icon: Icon, style, compact,
}) {
  const th = useTheme();
  const fg = kind === 'primary' ? th.iron.text : kind === 'secondary' ? th.goldLeaf.ink : th.ink;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      onPress={disabled ? undefined : onPress}
      style={({ pressed }) => [
        {
          minHeight: MIN_TARGET + 4,
          paddingHorizontal: compact ? 14 : 20,
          borderWidth: kind === 'tertiary' ? 1.5 : 1,
          borderColor: kind === 'secondary' ? th.goldLeaf.lo : kind === 'primary' ? th.iron.lo : th.iron.mid,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          gap: 8,
          overflow: 'hidden',
          opacity: disabled ? 0.4 : pressed ? 0.85 : 1,
        },
        style,
      ]}
    >
      {kind === 'primary' && <IronFill />}
      {kind === 'secondary' && <GoldFill />}
      {kind === 'primary' && <Keyline color={th.goldLeaf.mid} />}
      {kind === 'secondary' && <Keyline color={th.goldLeaf.lo} />}
      {kind === 'primary' && <Rivets size={4} inset={6} />}
      {Icon && <Icon size={18} color={fg} strokeWidth={1.75} />}
      <T v="plate" color={fg} numberOfLines={1}>{title}</T>
    </Pressable>
  );
}

export function IconButton({ icon: Icon, onPress, label, color, disabled }) {
  const th = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={disabled ? undefined : onPress}
      hitSlop={4}
      style={({ pressed }) => ({
        width: MIN_TARGET, height: MIN_TARGET, alignItems: 'center', justifyContent: 'center',
        opacity: disabled ? 0.3 : pressed ? 0.6 : 1,
      })}
    >
      <Icon size={22} color={color || th.ink} strokeWidth={1.5} />
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
    width: MIN_TARGET, height: MIN_TARGET, borderWidth: 1.5, borderColor: th.iron.mid, alignItems: 'center', justifyContent: 'center', backgroundColor: th.ledger,
  };
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }} accessibilityLabel={label}>
      <Pressable accessibilityLabel={`Less ${label || ''}`} onPress={() => set(value - step)} style={[box, { opacity: value - step < min ? 0.3 : 1 }]}>
        <Minus size={18} color={th.ink} strokeWidth={1.5} />
      </Pressable>
      <View style={{ minWidth: 40, alignItems: 'center' }}>
        <T style={{ fontFamily: FONTS.money, fontSize: 18 }}>{value}</T>
      </View>
      <Pressable accessibilityLabel={`More ${label || ''}`} onPress={() => set(value + step)} style={[box, { opacity: value + step > max ? 0.3 : 1 }]}>
        <Plus size={18} color={th.ink} strokeWidth={1.5} />
      </Pressable>
    </View>
  );
}

export function Screen({ children, style }) {
  const th = useTheme();
  return <View style={[{ flex: 1, backgroundColor: th.paper }, style]}>{children}</View>;
}

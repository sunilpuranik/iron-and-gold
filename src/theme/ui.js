// Shared "Engraver's Ink" primitives: text, rules, buttons, cards, steppers.
import { Pressable, Text, View } from 'react-native';
import { Minus, Plus } from 'lucide-react-native';
import { useTheme } from './theme';
import { FONTS, MIN_TARGET } from './tokens';
import { feel } from '../feel/feel';

const VARIANTS = {
  display: { fontFamily: FONTS.display, fontSize: 22 },
  title: { fontFamily: FONTS.display, fontSize: 18 },
  accent: { fontFamily: FONTS.accent, fontSize: 15 },
  body: { fontFamily: FONTS.ui, fontSize: 14 },
  label: { fontFamily: FONTS.uiMedium, fontSize: 12, letterSpacing: 0.4 },
  small: { fontFamily: FONTS.ui, fontSize: 11 },
  strong: { fontFamily: FONTS.uiSemi, fontSize: 14 },
};

export function T({ v = 'body', color, style, ...rest }) {
  const th = useTheme();
  return <Text {...rest} style={[VARIANTS[v], { color: color || th.ink }, style]} />;
}

export function Money({ amount, v = 'strong', style }) {
  const th = useTheme();
  return <T v={v} color={th.gilt} style={style}>${amount.toLocaleString('en-US')}</T>;
}

// 3px double rule: two hairlines with a 1px gap.
export function DoubleRule({ color, style }) {
  const th = useTheme();
  const c = color || th.ink;
  return <View style={[{ height: 3, borderTopWidth: 1, borderBottomWidth: 1, borderColor: c }, style]} />;
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

export function Card({ children, style }) {
  const th = useTheme();
  return (
    <View style={[{ backgroundColor: th.ledger, borderWidth: 1, borderColor: th.ink, padding: 14 }, style]}>
      <Keyline color={th.gilt} />
      {children}
    </View>
  );
}

// kind: primary (ink + gilt keyline) | secondary (gilt) | tertiary (outline)
export function Button({ title, onPress, kind = 'primary', disabled, icon: Icon, style, compact }) {
  const th = useTheme();
  const bg = kind === 'primary' ? th.ink : kind === 'secondary' ? th.gilt : 'transparent';
  const fg = kind === 'primary' ? th.onInk : kind === 'secondary' ? th.onInk : th.ink;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      onPress={disabled ? undefined : onPress}
      style={({ pressed }) => [
        {
          minHeight: MIN_TARGET,
          paddingHorizontal: compact ? 12 : 18,
          backgroundColor: bg,
          borderWidth: 1,
          borderColor: kind === 'secondary' ? th.gilt : th.ink,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          gap: 8,
          opacity: disabled ? 0.4 : pressed ? 0.8 : 1,
        },
        style,
      ]}
    >
      {kind === 'primary' && <Keyline color={th.gilt} />}
      {Icon && <Icon size={18} color={fg} strokeWidth={1.5} />}
      <T v="strong" color={fg}>{title}</T>
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
  const box = { width: MIN_TARGET, height: MIN_TARGET, borderWidth: 1, borderColor: th.ink, alignItems: 'center', justifyContent: 'center' };
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }} accessibilityLabel={label}>
      <Pressable accessibilityLabel={`Less ${label || ''}`} onPress={() => set(value - step)} style={[box, { opacity: value - step < min ? 0.3 : 1 }]}>
        <Minus size={18} color={th.ink} strokeWidth={1.5} />
      </Pressable>
      <View style={{ minWidth: 40, alignItems: 'center' }}>
        <T v="strong" style={{ fontSize: 18 }}>{value}</T>
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

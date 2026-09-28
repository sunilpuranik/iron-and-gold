// Tabs.
//   underline — the Deeds / Market / Tycoons strip: engraved labels over a gold underline
//   switch    — the compact icon switch in the header (Map ⇄ Exchange); the lit segment is iron
// items: names, or { key, label, icon, flag } — flag puts a gold dot on a segment that wants attention.
import { Pressable, View } from 'react-native';
import { useTheme } from '../../theme/theme';
import { T } from '../../theme/ui';
import { IronFill } from '../../theme/brand';
import { MIN_TARGET } from '../../theme/tokens';
import { feel } from '../../feel/feel';

export const TAB_NAMES = ['Deeds', 'Market', 'Tycoons'];
export const TAB_BODY_HEIGHT = 146; // two rows of deed cards

const norm = (it) => (typeof it === 'string' ? { key: it, label: it } : it);

function pick(on, onChange, key) {
  return () => {
    if (!on) feel.select();
    onChange(key);
  };
}

function Switch({ items, value, onChange }) {
  const th = useTheme();
  return (
    <View style={{ flexDirection: 'row', borderWidth: 1, borderColor: th.field }}>
      {items.map(({
        key, label, icon: Icon, flag,
      }, i) => {
        const on = value === key;
        return (
          <View key={key} style={{ flexDirection: 'row' }}>
            {i > 0 && <View style={{ width: 1, backgroundColor: th.field }} />}
            <Pressable
              accessibilityRole="tab"
              accessibilityState={{ selected: on }}
              accessibilityLabel={label}
              hitSlop={{ top: 6, bottom: 6 }}
              onPress={pick(on, onChange, key)}
              style={{
                width: 42, height: 38, alignItems: 'center', justifyContent: 'center',
                backgroundColor: th.raised, overflow: 'hidden',
              }}
            >
              {on && <IronFill />}
              <View>
                <Icon size={19} color={on ? th.iron.text : th.inkSoft} strokeWidth={1.75} />
              </View>
              {flag && (
                <View
                  style={{
                    position: 'absolute', top: 4, right: 4, width: 8, height: 8, borderRadius: 4,
                    backgroundColor: th.gold.bright, borderWidth: 1, borderColor: th.gold.deep,
                  }}
                />
              )}
            </Pressable>
          </View>
        );
      })}
    </View>
  );
}

export default function Tabs({
  kind = 'underline', items = TAB_NAMES, value, onChange,
}) {
  const th = useTheme();
  const list = items.map(norm);
  if (kind === 'switch') return <Switch items={list} value={value} onChange={onChange} />;
  return (
    <View style={{ flexDirection: 'row', borderTopWidth: 1, borderBottomWidth: 1, borderColor: th.rule, backgroundColor: th.ground }}>
      {list.map(({ key, label }, i) => {
        const on = value === key;
        return (
          <Pressable
            key={key}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            onPress={pick(on, onChange, key)}
            style={{
              flex: 1, minHeight: MIN_TARGET, alignItems: 'center', justifyContent: 'center',
              backgroundColor: on ? th.raised : th.ground,
              borderLeftWidth: i ? 1 : 0, borderColor: th.rule,
            }}
          >
            <T v="plate" color={on ? th.ink : th.inkFaint}>{label}</T>
            {on && <View style={{ position: 'absolute', bottom: 0, left: 12, right: 12, height: 2, backgroundColor: th.selection }} />}
          </Pressable>
        );
      })}
    </View>
  );
}

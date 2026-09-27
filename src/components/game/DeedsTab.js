import { Pressable, View } from 'react-native';
import { useTheme } from '../../theme/theme';
import { T } from '../../theme/ui';
import { districtOf, flavourOf } from '../../game/data';
import { classify, effectOf } from '../../game/engine';

export default function DeedsTab({ state, hand, selected, canBuild, onDeed }) {
  const th = useTheme();
  if (!hand) return <T v="accent" color={th.inkSoft} style={{ padding: 16 }}>No deeds in hand.</T>;
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', padding: 6, gap: 6 }}>
      {hand.map((t) => {
        const d = districtOf(t);
        const kind = classify(state, t).kind;
        const legal = kind !== 'dead' && kind !== 'blocked';
        const on = selected === t;
        const fg = on ? th.onInk : th.ink;
        return (
          <Pressable
            key={t}
            accessibilityLabel={`Deed ${t}, ${effectOf(state, t)}`}
            disabled={!canBuild || !legal}
            onPress={() => onDeed(t)}
            style={{
              width: '32%', flexGrow: 1, height: 76, padding: 6,
              backgroundColor: on ? th.ink : th.districts[d.key].tint,
              borderWidth: 1, borderColor: on ? th.gilt : th.ink,
              opacity: legal ? 1 : 0.45,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' }}>
              <T v="title" color={fg}>{t}</T>
              <T v="small" color={on ? th.onInk : th.districts[d.key].accent} numberOfLines={1}>{flavourOf(t)}</T>
            </View>
            <T v="small" color={fg} numberOfLines={2} style={{ marginTop: 2 }}>{effectOf(state, t)}</T>
          </Pressable>
        );
      })}
    </View>
  );
}

import { Pressable, View } from 'react-native';
import { Plus } from 'lucide-react-native';
import { useTheme } from '../../theme/theme';
import { T } from '../../theme/ui';
import { districtOf, flavourOf } from '../../game/data';
import { classify, effectOf } from '../../game/engine';
import CompanyIcon from '../CompanyIcon';

export const DEED_HEIGHT = 64;

// The company a deed would build into — the same icon the plot will show on the board.
function targetOf(c) {
  if (c.kind === 'grow') return c.company;
  if (c.kind === 'buyout') return c.tied.length > 1 ? null : c.companies[0];
  return null;
}

function Badge({ c }) {
  const th = useTheme();
  const target = targetOf(c);
  if (target) return <CompanyIcon id={target} size={22} />;
  if (c.kind === 'found' || (c.kind === 'buyout' && c.tied.length > 1)) {
    return (
      <View style={{ width: 22, height: 22, borderWidth: 1, borderStyle: 'dashed', borderColor: th.ink, alignItems: 'center', justifyContent: 'center' }}>
        <Plus size={14} color={th.ink} strokeWidth={1.5} />
      </View>
    );
  }
  return null;
}

export default function DeedsTab({ state, hand, selected, canBuild, onDeed }) {
  const th = useTheme();
  if (!hand) return <T v="accent" color={th.inkSoft} style={{ padding: 16 }}>No deeds in hand.</T>;
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', padding: 6, gap: 6 }}>
      {hand.map((t) => {
        const d = districtOf(t);
        const dc = th.districts[d.key];
        const c = classify(state, t);
        const legal = c.kind !== 'dead' && c.kind !== 'blocked';
        const on = selected === t;
        const fg = on ? th.onInk : th.ink;
        return (
          <Pressable
            key={t}
            accessibilityLabel={`Deed ${t}, ${d.name} (${flavourOf(t)}), ${effectOf(state, t)}`}
            disabled={!canBuild || !legal}
            onPress={() => onDeed(t)}
            style={{
              width: '32%', flexGrow: 1, height: DEED_HEIGHT, paddingHorizontal: 6, paddingVertical: 4,
              backgroundColor: on ? th.ink : dc.tint,
              borderWidth: 1, borderColor: on ? th.gilt : th.ink, borderLeftWidth: 4, borderLeftColor: dc.accent,
              opacity: legal ? 1 : 0.45,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <T v="title" color={fg}>{t}</T>
              <Badge c={c} />
            </View>
            <T v="label" color={on ? th.onInk : dc.accent} numberOfLines={1} style={{ fontSize: 11 }}>
              {d.name}
            </T>
            <T v="small" color={fg} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>
              {effectOf(state, t)}
            </T>
          </Pressable>
        );
      })}
    </View>
  );
}

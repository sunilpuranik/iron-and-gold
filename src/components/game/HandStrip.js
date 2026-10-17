// The folded bottom panel: your hand as one slim row of deed chips, plus a handle that opens the full
// Deeds / Market / Tycoons panel. Chips work like the deed cards (tap to pick, tap again to build).
import { Pressable, View } from 'react-native';
import { ChevronUp, Plus } from 'lucide-react-native';
import { useTheme } from '../../theme/theme';
import { T } from '../../theme/ui';
import { MIN_TARGET } from '../../theme/tokens';
import { districtOf, flavourOf } from '../../game/data';
import { classify, effectOf } from '../../game/engine';
import { feel } from '../../feel/feel';
import CompanyMark from '../CompanyMark';

export const STRIP_HEIGHT = MIN_TARGET + 4;

function Mark({ c }) {
  const th = useTheme();
  if (c.kind === 'grow') return <CompanyMark id={c.company} size={16} />;
  if (c.kind === 'buyout' && c.tied.length === 1) return <CompanyMark id={c.companies[0]} size={16} />;
  if (c.kind === 'found' || c.kind === 'buyout') {
    return (
      <View style={{ width: 16, height: 16, borderWidth: 1, borderStyle: 'dashed', borderColor: th.ink, alignItems: 'center', justifyContent: 'center' }}>
        <Plus size={11} color={th.ink} strokeWidth={1.5} />
      </View>
    );
  }
  return null;
}

export function PanelHandle({ open, onToggle }) {
  const th = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={open ? 'Fold the panel away' : 'Open deeds, market and tycoons'}
      accessibilityState={{ expanded: open }}
      onPress={() => { feel.select(); onToggle(); }}
      hitSlop={4}
      style={({ pressed }) => ({
        width: MIN_TARGET, alignSelf: 'stretch', alignItems: 'center', justifyContent: 'center',
        borderLeftWidth: 1, borderColor: th.rule, backgroundColor: pressed ? th.raised : th.ground,
      })}
    >
      <View style={{ transform: [{ rotate: open ? '180deg' : '0deg' }] }}>
        <ChevronUp size={20} color={th.inkSoft} strokeWidth={1.75} />
      </View>
    </Pressable>
  );
}

export default function HandStrip({
  state, hand, selected, canBuild, onDeed, onOpen,
}) {
  const th = useTheme();
  return (
    <View style={{ flexDirection: 'row', height: STRIP_HEIGHT, borderTopWidth: 1, borderColor: th.rule, backgroundColor: th.ground }}>
      <View style={{ flex: 1, flexDirection: 'row', gap: 4, padding: 4 }}>
        {hand ? hand.map((t) => {
          const d = districtOf(t);
          const dc = th.districts[d.key];
          const c = classify(state, t);
          const legal = c.kind !== 'dead' && c.kind !== 'blocked';
          const on = selected === t;
          return (
            <Pressable
              key={t}
              accessibilityLabel={`Deed ${t}, ${d.name} (${flavourOf(t)}), ${effectOf(state, t)}`}
              disabled={!canBuild || !legal}
              onPress={() => onDeed(t)}
              style={{
                flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4,
                backgroundColor: on ? th.ink : dc.tint,
                borderWidth: 1, borderColor: on ? th.selection : th.rule, borderLeftWidth: 3, borderLeftColor: dc.accent,
                opacity: legal ? 1 : 0.45,
              }}
            >
              <T v="plate" color={on ? th.ground : th.ink} numberOfLines={1} style={{ letterSpacing: 0.5 }}>{t}</T>
              <Mark c={c} />
            </Pressable>
          );
        }) : (
          <T v="accent" color={th.inkSoft} style={{ alignSelf: 'center', paddingHorizontal: 10 }}>No deeds in hand.</T>
        )}
      </View>
      <PanelHandle open={false} onToggle={onOpen} />
    </View>
  );
}

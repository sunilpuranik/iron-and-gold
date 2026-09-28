// Choosing a company.
//   mode="charter"  — found a new company on the plots you just joined (phase 'found')
//   mode="survivor" — name which of the tied companies survives a buyout (phase 'survivor')
import { Pressable, View } from 'react-native';
import { useTheme } from '../../theme/theme';
import { Money, T } from '../../theme/ui';
import { COMPANIES, TIER_NAMES, company } from '../../game/data';
import { floodFrom, price, sizes } from '../../game/engine';
import CompanyMark from '../CompanyMark';
import Sheet from './Sheet';

function Choice({
  id, label, hint, disabled, onPress, children,
}) {
  const th = useTheme();
  return (
    <Pressable
      disabled={disabled}
      onPress={() => onPress(id)}
      accessibilityLabel={label}
      style={({ pressed }) => ({
        flexDirection: 'row', alignItems: 'center', gap: 12, padding: 8, minHeight: 52,
        borderWidth: 1, borderColor: th.rule, backgroundColor: pressed ? th.plate : th.raised,
        opacity: disabled ? 0.35 : 1,
      })}
    >
      <CompanyMark id={id} size={36} />
      <View style={{ flex: 1 }}>
        <T v="strong">{company(id).name}</T>
        <T v="small" color={th.inkSoft}>{hint}</T>
      </View>
      {children}
    </Pressable>
  );
}

function Charter({ state, onPick }) {
  const sz = sizes(state);
  const newSize = floodFrom(state, state.pending.tile).length;
  return COMPANIES.map((c) => {
    const used = sz[c.id] > 0;
    return (
      <Choice
        key={c.id}
        id={c.id}
        label={`Charter ${c.name}`}
        hint={`${c.industry} · ${TIER_NAMES[c.tier]}${used ? ' · already on the board' : ''}`}
        disabled={used}
        onPress={onPick}
      >
        {!used && <Money amount={price(c.id, newSize)} />}
      </Choice>
    );
  });
}

function Survivor({ state, me, onPick }) {
  const { tied, companies } = state.pending;
  return tied.map((id) => (
    <Choice
      key={id}
      id={id}
      label={`${company(id).name} survives`}
      hint={`Absorbs ${companies.filter((c) => c !== id).map((c) => company(c).short).join(', ')}${me ? ` · you hold ${me.shares[id]}` : ''}`}
      onPress={onPick}
    />
  ));
}

export default function CompanySheet({
  mode = 'charter', visible, state, me, onPick, onClose,
}) {
  if (mode === 'charter') {
    if (!state.pending || state.phase !== 'found') return null;
    const newSize = floodFrom(state, state.pending.tile).length;
    return (
      <Sheet
        visible={visible}
        title="Charter a company"
        subtitle={`${newSize} plots at ${state.pending.tile} · you receive 1 founder share`}
        onClose={onClose}
      >
        <Charter state={state} onPick={onPick} />
      </Sheet>
    );
  }
  if (state.phase !== 'survivor') return null;
  const { tied } = state.pending;
  return (
    <Sheet
      visible={visible}
      title="Tied buyout"
      subtitle={`${tied.length} companies of ${sizes(state)[tied[0]]} plots meet. Name the survivor.`}
      onClose={onClose}
    >
      <Survivor state={state} me={me} onPick={onPick} />
    </Sheet>
  );
}

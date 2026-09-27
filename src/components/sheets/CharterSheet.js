import { Pressable, View } from 'react-native';
import { useTheme } from '../../theme/theme';
import { Money, T } from '../../theme/ui';
import { COMPANIES, TIER_NAMES } from '../../game/data';
import { floodFrom, price, sizes } from '../../game/engine';
import CompanyIcon from '../CompanyIcon';
import Sheet from './Sheet';

export default function CharterSheet({ visible, state, onPick, onClose }) {
  const th = useTheme();
  if (!state.pending || state.phase !== 'found') return null;
  const sz = sizes(state);
  const newSize = floodFrom(state, state.pending.tile).length;
  return (
    <Sheet
      visible={visible}
      title="Charter a company"
      subtitle={`${newSize} plots at ${state.pending.tile} · you receive 1 founder share`}
      onClose={onClose}
    >
      {COMPANIES.map((c) => {
        const used = sz[c.id] > 0;
        return (
          <Pressable
            key={c.id}
            disabled={used}
            onPress={() => onPick(c.id)}
            accessibilityLabel={`Charter ${c.name}`}
            style={({ pressed }) => ({
              flexDirection: 'row', alignItems: 'center', gap: 12, padding: 8, minHeight: 52,
              borderWidth: 1, borderColor: th.ink, backgroundColor: pressed ? th.ledger : th.paper,
              opacity: used ? 0.35 : 1,
            })}
          >
            <CompanyIcon id={c.id} size={36} />
            <View style={{ flex: 1 }}>
              <T v="strong">{c.name}</T>
              <T v="small" color={th.inkSoft}>
                {c.industry} · {TIER_NAMES[c.tier]}{used ? ' · already on the board' : ''}
              </T>
            </View>
            {!used && <Money amount={price(c.id, newSize)} />}
          </Pressable>
        );
      })}
    </Sheet>
  );
}

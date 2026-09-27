import { Pressable, View } from 'react-native';
import { useTheme } from '../../theme/theme';
import { T } from '../../theme/ui';
import { company } from '../../game/data';
import { sizes } from '../../game/engine';
import CompanyIcon from '../CompanyIcon';
import Sheet from './Sheet';

export default function SurvivorSheet({ visible, state, me, onPick, onClose }) {
  const th = useTheme();
  if (state.phase !== 'survivor') return null;
  const sz = sizes(state);
  const { tied, companies } = state.pending;
  return (
    <Sheet
      visible={visible}
      title="Tied buyout"
      subtitle={`${tied.length} companies of ${sz[tied[0]]} plots meet. Name the survivor.`}
      onClose={onClose}
    >
      {tied.map((id) => (
        <Pressable
          key={id}
          onPress={() => onPick(id)}
          accessibilityLabel={`${company(id).name} survives`}
          style={({ pressed }) => ({
            flexDirection: 'row', alignItems: 'center', gap: 12, padding: 8, minHeight: 52,
            borderWidth: 1, borderColor: th.ink, backgroundColor: pressed ? th.ledger : th.paper,
          })}
        >
          <CompanyIcon id={id} size={36} />
          <View style={{ flex: 1 }}>
            <T v="strong">{company(id).name}</T>
            <T v="small" color={th.inkSoft}>
              Absorbs {companies.filter((c) => c !== id).map((c) => company(c).short).join(', ')}
              {me ? ` · you hold ${me.shares[id]}` : ''}
            </T>
          </View>
        </Pressable>
      ))}
    </Sheet>
  );
}

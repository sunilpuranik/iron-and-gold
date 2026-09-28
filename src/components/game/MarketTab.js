import { Pressable, ScrollView, View } from 'react-native';
import { Diamond, ScrollText } from 'lucide-react-native';
import { useTheme } from '../../theme/theme';
import { Money, T } from '../../theme/ui';
import { COMPANIES, TIER_NAMES } from '../../game/data';
import { isTrust, price, sizes } from '../../game/engine';
import CompanyMark from '../CompanyMark';

export default function MarketTab({ state, me, onCertificate }) {
  const th = useTheme();
  const sz = sizes(state);
  return (
    <ScrollView contentContainerStyle={{ paddingVertical: 4 }}>
      {COMPANIES.map((c) => {
        const size = sz[c.id];
        const active = size >= 2;
        return (
          <Pressable
            key={c.id}
            accessibilityLabel={`${c.name} share certificate`}
            onPress={() => onCertificate(c.id)}
            style={({ pressed }) => ({
              flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 12, minHeight: 48,
              borderBottomWidth: 1, borderColor: th.rule, opacity: active ? 1 : 0.55,
              backgroundColor: pressed ? th.ledger : 'transparent',
            })}
          >
            <CompanyMark id={c.id} size={30} />
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <T v="strong" numberOfLines={1}>{c.name}</T>
                {isTrust(size) && <Diamond size={12} color={th.gilt} fill={th.gilt} strokeWidth={1.5} />}
              </View>
              <T v="small" color={th.inkSoft}>
                {c.industry} · {TIER_NAMES[c.tier]} · {active ? `${size} plots` : 'not chartered'} · bank {state.bank[c.id]}
              </T>
            </View>
            <View style={{ alignItems: 'flex-end', minWidth: 64 }}>
              {active ? <Money amount={price(c.id, size)} /> : <T v="small" color={th.inkSoft}>—</T>}
              <T v="small" color={th.inkSoft}>{me ? `you hold ${me.shares[c.id]}` : ''}</T>
            </View>
            <ScrollText size={18} color={th.inkSoft} strokeWidth={1.5} />
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

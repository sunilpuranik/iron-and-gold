import { ScrollView, View } from 'react-native';
import { useTheme } from '../../theme/theme';
import { Money, T } from '../../theme/ui';
import { COMPANY_IDS } from '../../game/data';
import { actorOf } from '../../game/engine';
import Avatar from '../Avatar';
import CompanyIcon from '../CompanyIcon';

export default function TycoonsTab({ state, mySeat }) {
  const th = useTheme();
  const acting = state.phase === 'over' ? -1 : actorOf(state);
  return (
    <ScrollView contentContainerStyle={{ paddingVertical: 4 }}>
      {state.players.map((p, seat) => (
        <View
          key={p.id}
          style={{
            flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 12, paddingVertical: 6,
            minHeight: 48, borderBottomWidth: 1, borderColor: th.rule,
          }}
        >
          <Avatar index={p.avatar} bot={p.bot} size={40} ring={seat === acting} />
          <View style={{ flex: 1 }}>
            <T v="strong" numberOfLines={1}>
              {p.name}{seat === mySeat ? ' (you)' : ''}
            </T>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 3 }}>
              {COMPANY_IDS.filter((c) => p.shares[c] > 0).map((c) => (
                <View key={c} style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                  <CompanyIcon id={c} size={16} />
                  <T v="small">{p.shares[c]}</T>
                </View>
              ))}
              {COMPANY_IDS.every((c) => !p.shares[c]) && <T v="small" color={th.inkSoft}>No shares</T>}
            </View>
          </View>
          <Money amount={p.cash} />
        </View>
      ))}
    </ScrollView>
  );
}

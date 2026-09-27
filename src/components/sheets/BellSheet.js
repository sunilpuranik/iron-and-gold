import { View } from 'react-native';
import { Crown } from 'lucide-react-native';
import { useTheme } from '../../theme/theme';
import { Button, Money, T } from '../../theme/ui';
import Avatar from '../Avatar';
import Sheet from './Sheet';

export default function BellSheet({ visible, state, mySeat, onHome, onClose }) {
  const th = useTheme();
  if (state.phase !== 'over') return null;
  return (
    <Sheet
      visible={visible}
      title="Closing bell"
      subtitle={state.reason}
      onClose={onClose}
      footer={<Button title="Back to town" onPress={onHome} />}
    >
      <T v="small" color={th.inkSoft}>Final bonuses paid for every company; all shares sold at the closing price.</T>
      {state.results.map((r) => {
        const p = state.players[r.seat];
        const top = r.rank === 1;
        return (
          <View
            key={p.id}
            style={{
              flexDirection: 'row', alignItems: 'center', gap: 12, padding: 10, minHeight: 52,
              borderWidth: top ? 2 : 1, borderColor: top ? th.gilt : th.ink,
              backgroundColor: top ? th.ledger : th.paper,
            }}
          >
            <T v="display" style={{ width: 26 }}>{r.rank}</T>
            <Avatar index={p.avatar} bot={p.bot} size={32} />
            <View style={{ flex: 1 }}>
              <T v="strong">{p.name}{r.seat === mySeat ? ' (you)' : ''}</T>
              {top && <T v="accent" color={th.gilt}>Tycoon of the frontier</T>}
            </View>
            {top && <Crown size={18} color={th.gilt} strokeWidth={1.5} />}
            <Money amount={r.cash} v="title" />
          </View>
        );
      })}
    </Sheet>
  );
}

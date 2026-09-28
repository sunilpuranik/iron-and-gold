import { View } from 'react-native';
import { Crown } from 'lucide-react-native';
import { useTheme } from '../../theme/theme';
import {
  Button, Money, T,
} from '../../theme/ui';
import Portrait from '../Portrait';
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
              borderWidth: top ? 2 : 1, borderColor: top ? th.accent : th.rule,
              backgroundColor: top ? th.plate : th.raised,
            }}
          >
            <T v="display" style={{ width: 26 }}>{r.rank}</T>
            <Portrait index={p.avatar} bot={p.bot} size={40} />
            <View style={{ flex: 1 }}>
              <T v="strong">{p.name}{r.seat === mySeat ? ' (you)' : ''}</T>
              {top && <T v="accent" color={th.money}>Tycoon of the frontier</T>}
            </View>
            {top && <Crown size={18} color={th.accent} strokeWidth={1.5} />}
            {top ? <Money amount={r.cash} v="ingot" size={16} /> : <Money amount={r.cash} v="title" />}
          </View>
        );
      })}
    </Sheet>
  );
}

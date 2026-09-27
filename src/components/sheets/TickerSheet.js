// The ticker: every move so far, newest first. Opened from the newspaper in the header.
import { View } from 'react-native';
import { useTheme } from '../../theme/theme';
import { T } from '../../theme/ui';
import Sheet from './Sheet';

export default function TickerSheet({ visible, state, onClose }) {
  const th = useTheme();
  if (!visible) return null;
  const color = (kind) => {
    if (kind === 'money' || kind === 'bell') return th.gilt;
    if (kind === 'buyout') return th.ink;
    return th.inkSoft;
  };
  return (
    <Sheet visible title="Ticker" subtitle="The town telegraph, newest first" onClose={onClose}>
      {state.log.slice().reverse().map((l, i) => (
        <View key={`${l.seq}-${i}`} style={{ flexDirection: 'row', gap: 8 }}>
          <T v="small" color={th.inkSoft} style={{ width: 28 }}>{l.turn}</T>
          <T v={l.kind === 'buyout' ? 'strong' : 'body'} color={color(l.kind)} style={{ flex: 1, fontSize: 13 }}>
            {l.text}
          </T>
        </View>
      ))}
    </Sheet>
  );
}

import { ScrollView, View } from 'react-native';
import { useTheme } from '../../theme/theme';
import { T } from '../../theme/ui';

export default function TickerTab({ state }) {
  const th = useTheme();
  const lines = state.log.slice().reverse();
  const color = (kind) => {
    if (kind === 'money' || kind === 'bell') return th.gilt;
    if (kind === 'buyout') return th.ink;
    return th.inkSoft;
  };
  return (
    <ScrollView contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 6 }}>
      {lines.map((l, i) => (
        <View key={`${l.seq}-${i}`} style={{ flexDirection: 'row', gap: 8, paddingVertical: 3 }}>
          <T v="small" color={th.rule} style={{ width: 28 }}>{l.turn}</T>
          <T v={l.kind === 'buyout' ? 'strong' : 'body'} color={color(l.kind)} style={{ flex: 1, fontSize: 13 }}>
            {l.text}
          </T>
        </View>
      ))}
    </ScrollView>
  );
}

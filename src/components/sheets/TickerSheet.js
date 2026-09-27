// The ticker: every move so far, newest first. Opened from the newspaper in the header.
import { Switch, View } from 'react-native';
import { useTheme } from '../../theme/theme';
import { T } from '../../theme/ui';
import Sheet from './Sheet';

export default function TickerSheet({
  visible, state, dispatches, onDispatches, onClose,
}) {
  const th = useTheme();
  if (!visible) return null;
  const color = (kind) => {
    if (kind === 'money' || kind === 'bell') return th.gilt;
    if (kind === 'buyout') return th.ink;
    return th.inkSoft;
  };
  return (
    <Sheet visible title="Ticker" subtitle="The town telegraph, newest first" onClose={onClose}>
      {onDispatches && (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 44, borderBottomWidth: 1, borderColor: th.rule, paddingBottom: 8 }}>
          <View style={{ flex: 1 }}>
            <T v="strong">Turn dispatches</T>
            <T v="small" color={th.inkSoft}>A telegram after each tycoon's turn, and a recap when the phone is passed to you.</T>
          </View>
          <Switch
            value={dispatches}
            onValueChange={onDispatches}
            trackColor={{ true: th.gilt, false: th.rule }}
            thumbColor={th.paper}
            activeThumbColor={th.paper}
            accessibilityLabel="Turn dispatches"
          />
        </View>
      )}
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

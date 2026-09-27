import { View } from 'react-native';
import { House, Newspaper } from 'lucide-react-native';
import { useTheme } from '../../theme/theme';
import { DoubleRule, IconButton, Money, T } from '../../theme/ui';

export default function Header({
  state, me, onHome, onTicker,
}) {
  const th = useTheme();
  return (
    <View style={{ backgroundColor: th.paper }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingRight: 12, minHeight: 48 }}>
        <IconButton icon={House} label="Home" onPress={onHome} />
        <View style={{ flex: 1 }}>
          <T v="title">{'Iron & Gold'}</T>
          <T v="small" color={th.inkSoft}>
            Turn {state.turnNo} · {state.pool.length} deeds left
          </T>
        </View>
        <IconButton icon={Newspaper} label="Ticker" onPress={onTicker} color={th.inkSoft} />
        {me && (
          <View style={{ alignItems: 'flex-end' }}>
            <T v="small" color={th.inkSoft}>{me.name}</T>
            <Money amount={me.cash} v="title" />
          </View>
        )}
      </View>
      <DoubleRule />
    </View>
  );
}

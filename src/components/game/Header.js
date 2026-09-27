import { View } from 'react-native';
import { House, Newspaper } from 'lucide-react-native';
import { useTheme } from '../../theme/theme';
import {
  DoubleRule, IconButton, Ingot, T,
} from '../../theme/ui';
import { Wordmark } from '../../theme/brand';

export default function Header({
  state, me, onHome, onTicker,
}) {
  const th = useTheme();
  return (
    <View style={{ backgroundColor: th.paper }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingRight: 12, minHeight: 48 }}>
        <IconButton icon={House} label="Home" onPress={onHome} />
        <View style={{ flex: 1 }}>
          <Wordmark size={19} />
          <T v="small" color={th.inkSoft}>
            Turn {state.turnNo} · {state.pool.length} deeds left
          </T>
        </View>
        <IconButton icon={Newspaper} label="Ticker" onPress={onTicker} color={th.inkSoft} />
        {me && (
          <View style={{ alignItems: 'flex-end' }}>
            <T v="small" color={th.inkSoft} style={{ marginBottom: 2 }}>{me.name}</T>
            <Ingot amount={me.cash} size={15} style={{ alignSelf: 'flex-end' }} />
          </View>
        )}
      </View>
      <DoubleRule />
    </View>
  );
}

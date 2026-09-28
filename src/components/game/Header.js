import { Pressable, View } from 'react-native';
import { ChartColumn, Map as MapIcon } from 'lucide-react-native';
import { useTheme } from '../../theme/theme';
import { Money, Rule, T } from '../../theme/ui';
import { FONTS } from '../../theme/tokens';
import { Seal, Wordmark } from '../../theme/brand';
import Tabs from './Tabs';

// Coin seal (home) · wordmark with turn line · Map/Exchange switch · your cash.
export default function Header({
  state, me, onHome, view, onView, mine, over,
}) {
  const th = useTheme();
  return (
    <View style={{ backgroundColor: th.ground }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingRight: 10, paddingLeft: 8, gap: 8, minHeight: 54 }}>
        <Pressable
          onPress={onHome}
          accessibilityRole="button"
          accessibilityLabel="Home"
          hitSlop={6}
          style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
        >
          <Seal kind="coin" size={40} />
        </Pressable>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Wordmark size={17} />
          {mine && !over ? (
            <T numberOfLines={1} style={{ fontFamily: FONTS.money, fontSize: 11, letterSpacing: 1, color: th.accent }}>
              YOUR TURN · {state.turnNo}
            </T>
          ) : (
            <T v="small" color={th.inkSoft} numberOfLines={1}>
              Turn {state.turnNo} · {state.pool.length} deeds left
            </T>
          )}
        </View>
        <Tabs
          kind="switch"
          value={view}
          onChange={onView}
          items={[
            { key: 'map', label: 'Show the map', icon: MapIcon, flag: mine && !over && view !== 'map' },
            { key: 'exchange', label: 'Show the exchange', icon: ChartColumn },
          ]}
        />
        {me && <Money amount={me.cash} v="ingot" size={14} style={{ alignSelf: 'center' }} />}
      </View>
      <Rule kind="rail" />
    </View>
  );
}

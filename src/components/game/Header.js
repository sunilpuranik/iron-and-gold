import { Pressable, View } from 'react-native';
import { useTheme } from '../../theme/theme';
import { DoubleRule, Ingot, T } from '../../theme/ui';
import { FONTS } from '../../theme/tokens';
import { Wordmark } from '../../theme/brand';
import Emblem from '../Emblem';
import ViewSwitch from './ViewSwitch';

// Emblem (home) · wordmark with turn line · Map/Exchange switch · your cash.
export default function Header({
  state, me, onHome, view, onView, mine, over,
}) {
  const th = useTheme();
  return (
    <View style={{ backgroundColor: th.paper }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingRight: 10, paddingLeft: 8, gap: 8, minHeight: 54 }}>
        <Pressable
          onPress={onHome}
          accessibilityRole="button"
          accessibilityLabel="Home"
          hitSlop={6}
          style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
        >
          <Emblem size={40} />
        </Pressable>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Wordmark size={17} />
          {mine && !over ? (
            <T numberOfLines={1} style={{ fontFamily: FONTS.money, fontSize: 11, letterSpacing: 1, color: th.gilt }}>
              YOUR TURN · {state.turnNo}
            </T>
          ) : (
            <T v="small" color={th.inkSoft} numberOfLines={1}>
              Turn {state.turnNo} · {state.pool.length} deeds left
            </T>
          )}
        </View>
        <ViewSwitch view={view} onView={onView} mine={mine && !over} />
        {me && <Ingot amount={me.cash} size={14} style={{ alignSelf: 'center' }} />}
      </View>
      <DoubleRule />
    </View>
  );
}

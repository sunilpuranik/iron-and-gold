// Turn dispatches: a telegram card that drops in after another tycoon's turn,
// and the recap list shown on the pass-and-play handoff screen.
import { useEffect, useRef } from 'react';
import { Animated, Pressable, View } from 'react-native';
import { useTheme } from '../../theme/theme';
import { T } from '../../theme/ui';
import { FONTS } from '../../theme/tokens';
import { Rivets } from '../../theme/brand';
import Avatar from '../Avatar';

export function DispatchLines({ d, max = 4 }) {
  const th = useTheme();
  const shown = d.lines.slice(0, max);
  const more = d.lines.length - shown.length;
  return (
    <View style={{ gap: 2 }}>
      {shown.map((l, i) => (
        <T
          key={i}
          v={l.kind === 'buyout' ? 'strong' : 'body'}
          color={l.kind === 'money' || l.kind === 'bell' ? th.gilt : th.ink}
          style={{ fontSize: 13 }}
        >
          {l.text}
        </T>
      ))}
      {more > 0 && <T v="small" color={th.inkSoft}>+{more} more in the ticker</T>}
      {!d.lines.length && <T v="small" color={th.inkSoft}>Passed.</T>}
    </View>
  );
}

function Header({ d, extra }) {
  const th = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 }}>
      <Avatar index={d.player.avatar} bot={d.player.bot} size={36} />
      <View style={{ flex: 1 }}>
        <T style={{ fontFamily: FONTS.engraved, fontSize: 11, letterSpacing: 1.5, color: th.gilt }}>
          TELEGRAM · TURN {d.turn}
          {extra ? ` · +${extra} EARLIER` : ''}
        </T>
        <T v="title" numberOfLines={1}>{d.player.name}</T>
      </View>
    </View>
  );
}

// Slides in from the top of the board; tap to dismiss, hides itself after a few seconds.
export function DispatchToast({ dispatch, extra = 0, onDone }) {
  const th = useTheme();
  const y = useRef(new Animated.Value(-160)).current;

  useEffect(() => {
    if (!dispatch) return undefined;
    y.setValue(-160);
    Animated.spring(y, { toValue: 0, useNativeDriver: true, bounciness: 4 }).start();
    const ms = 3800 + Math.min(4, dispatch.lines.length) * 700;
    const t = setTimeout(() => {
      Animated.timing(y, { toValue: -200, duration: 220, useNativeDriver: true }).start(() => onDone());
    }, ms);
    return () => clearTimeout(t);
  }, [dispatch]);

  if (!dispatch) return null;
  return (
    <Animated.View
      style={{
        position: 'absolute', left: 10, right: 10, top: 4, zIndex: 20, transform: [{ translateY: y }],
      }}
    >
      <Pressable
        onPress={onDone}
        accessibilityLabel={`Dispatch from ${dispatch.player.name}. Tap to dismiss.`}
        style={{
          backgroundColor: th.paper, borderWidth: 2, borderColor: th.iron.mid, padding: 12,
          shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 6,
        }}
      >
        <View style={{ position: 'absolute', left: 3, right: 3, top: 3, bottom: 3, borderWidth: 1, borderColor: th.gilt }} />
        <Rivets size={5} inset={-3.5} />
        <Header d={dispatch} extra={extra} />
        <DispatchLines d={dispatch} />
      </Pressable>
    </Animated.View>
  );
}

// "While you were away" list for the handoff screen.
export function DispatchRecap({ dispatches }) {
  const th = useTheme();
  if (!dispatches.length) return null;
  return (
    <View style={{ alignSelf: 'stretch', gap: 10 }}>
      <T style={{ fontFamily: FONTS.engraved, fontSize: 12, letterSpacing: 1.5, color: th.gilt, textAlign: 'center' }}>
        SINCE YOUR LAST TURN
      </T>
      {dispatches.map((d) => (
        <View key={d.turn} style={{ flexDirection: 'row', gap: 10, borderTopWidth: 1, borderColor: th.rule, paddingTop: 8 }}>
          <Avatar index={d.player.avatar} bot={d.player.bot} size={30} />
          <View style={{ flex: 1 }}>
            <T v="strong">{d.player.name}</T>
            <DispatchLines d={d} max={3} />
          </View>
        </View>
      ))}
    </View>
  );
}

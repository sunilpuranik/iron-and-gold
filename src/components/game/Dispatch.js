// Turn dispatches, one component in three forms:
//   as="toast" — a telegram card that drops in after another tycoon's turn
//   as="recap" — the "since your last turn" list on the pass-and-play handoff screen
//   as="lines" — just the lines of one dispatch, for cards that frame their own
import { useEffect, useRef } from 'react';
import { Animated, Pressable, View } from 'react-native';
import { useTheme } from '../../theme/theme';
import { T } from '../../theme/ui';
import { FONTS } from '../../theme/tokens';
import { Plate } from '../../theme/brand';
import Portrait from '../Portrait';

function Lines({ d, max = 4 }) {
  const th = useTheme();
  const shown = d.lines.slice(0, max);
  const more = d.lines.length - shown.length;
  return (
    <View style={{ gap: 2 }}>
      {shown.map((l, i) => (
        <T
          key={i}
          v={l.kind === 'buyout' ? 'strong' : 'body'}
          color={l.kind === 'money' || l.kind === 'bell' ? th.money : th.ink}
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
      <Portrait index={d.player.avatar} bot={d.player.bot} size={36} />
      <View style={{ flex: 1 }}>
        <T style={{ fontFamily: FONTS.engraved, fontSize: 11, letterSpacing: 1.5, color: th.accent }}>
          TELEGRAM · TURN {d.turn}
          {extra ? ` · +${extra} EARLIER` : ''}
        </T>
        <T v="title" numberOfLines={1}>{d.player.name}</T>
      </View>
    </View>
  );
}

// Slides in from the top of the board; tap to dismiss, hides itself after a few seconds.
function Toast({ dispatch, extra = 0, onDone }) {
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
          shadowColor: '#000', shadowOpacity: 0.45, shadowRadius: 10, shadowOffset: { width: 0, height: 6 }, elevation: 6,
        }}
      >
        <Plate pad={14} style={{ backgroundColor: th.raised, borderTopWidth: 2, borderTopColor: th.accent }}>
          <Header d={dispatch} extra={extra} />
          <Lines d={dispatch} />
        </Plate>
      </Pressable>
    </Animated.View>
  );
}

// "While you were away" list for the handoff screen.
function Recap({ dispatches }) {
  const th = useTheme();
  if (!dispatches.length) return null;
  return (
    <View style={{ alignSelf: 'stretch', gap: 10 }}>
      <T style={{ fontFamily: FONTS.engraved, fontSize: 12, letterSpacing: 1.5, color: th.accent, textAlign: 'center' }}>
        SINCE YOUR LAST TURN
      </T>
      {dispatches.map((d) => (
        <View key={d.turn} style={{ flexDirection: 'row', gap: 10, borderTopWidth: 1, borderColor: th.rule, paddingTop: 8 }}>
          <Portrait index={d.player.avatar} bot={d.player.bot} size={30} />
          <View style={{ flex: 1 }}>
            <T v="strong">{d.player.name}</T>
            <Lines d={d} max={3} />
          </View>
        </View>
      ))}
    </View>
  );
}

export default function Dispatch({
  as = 'toast', dispatch, dispatches, extra, max, onDone,
}) {
  if (as === 'lines') return <Lines d={dispatch} max={max} />;
  if (as === 'recap') return <Recap dispatches={dispatches} />;
  return <Toast dispatch={dispatch} extra={extra} onDone={onDone} />;
}

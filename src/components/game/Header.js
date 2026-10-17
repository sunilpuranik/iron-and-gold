import { useState } from 'react';
import {
  Modal, Pressable, View, useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  BookOpen, ChartColumn, ChevronDown, House, Map as MapIcon,
} from 'lucide-react-native';
import { useTheme } from '../../theme/theme';
import { Money, Rule, T } from '../../theme/ui';
import { FONTS, MIN_TARGET } from '../../theme/tokens';
import { Seal, Wordmark } from '../../theme/brand';
import { actorOf } from '../../game/engine';
import { feel } from '../../feel/feel';
import Tabs from './Tabs';

// Below WIDE the wordmark gives its room to the turn line; below NARROW (iPhone SE) everything tightens.
const WIDE = 560;
const NARROW = 360;

// One row of the seal's menu.
function MenuItem({ icon: Icon, label, onPress }) {
  const th = useTheme();
  return (
    <Pressable
      accessibilityRole="menuitem"
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: MIN_TARGET + 4, paddingHorizontal: 14,
        backgroundColor: pressed ? th.field : 'transparent',
      })}
    >
      <Icon size={19} color={th.money} strokeWidth={1.6} />
      <T v="body" color={th.ink}>{label}</T>
    </Pressable>
  );
}

// The coin seal opens a small menu: How to play, and back to Home. Keeps both a tap away without
// spending header width on them.
function SealMenu({ onHome, onRules }) {
  const th = useTheme();
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);
  const go = (fn) => () => { setOpen(false); fn(); };
  return (
    <>
      <Pressable
        onPress={() => { feel.select(); setOpen(true); }}
        accessibilityRole="button"
        accessibilityLabel="Menu"
        accessibilityHint="How to play, or back to Home"
        hitSlop={6}
        style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
      >
        <Seal kind="coin" size={36} />
        <View style={{
          position: 'absolute', right: -3, bottom: -2, width: 16, height: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center',
          backgroundColor: th.raised, borderWidth: 1, borderColor: th.field,
        }}
        >
          <ChevronDown size={11} color={th.inkSoft} strokeWidth={2.2} />
        </View>
      </Pressable>
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)} statusBarTranslucent>
        <Pressable accessibilityLabel="Close menu" onPress={() => setOpen(false)} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.35)' }}>
          <View
            accessibilityRole="menu"
            style={{
              position: 'absolute', top: insets.top + 50, left: Math.max(insets.left, 8), minWidth: 210, paddingVertical: 4,
              backgroundColor: th.raised, borderWidth: 1, borderColor: th.gold.deep,
              shadowColor: '#000', shadowOpacity: 0.5, shadowRadius: 14, shadowOffset: { width: 0, height: 8 }, elevation: 10,
            }}
          >
            {onRules && <MenuItem icon={BookOpen} label="How to play" onPress={go(onRules)} />}
            <View style={{ height: 1, marginHorizontal: 10, backgroundColor: th.rule }} />
            <MenuItem icon={House} label="Back to home" onPress={go(onHome)} />
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

// Seal menu · turn line (with the wordmark on wide screens) · your cash · Map/Exchange switch.
export default function Header({
  state, me, onHome, view, onView, mine, over, onRules,
}) {
  const th = useTheme();
  const { width } = useWindowDimensions();
  const wide = width >= WIDE;
  const narrow = width < NARROW;
  const actor = over ? -1 : actorOf(state);
  const who = actor >= 0 ? state.players[actor].name : '';
  let headline;
  if (over) headline = 'Closing bell';
  else if (mine) headline = 'Your turn';
  else headline = who ? `${who}’s turn` : `Turn ${state.turnNo}`;
  const rival = !over && !mine && !!who;
  const lead = {
    fontFamily: FONTS.money, fontSize: narrow ? 12 : 13, letterSpacing: narrow ? 0.6 : 1.2, textTransform: 'uppercase',
  };
  const detail = `Turn ${state.turnNo} · ${state.pool.length} ${narrow ? 'left' : 'deeds left'}`;

  return (
    <View style={{ backgroundColor: th.ground }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingRight: narrow ? 6 : 8, paddingLeft: narrow ? 8 : 10, gap: narrow ? 7 : 10, minHeight: 50 }}>
        <SealMenu onHome={onHome} onRules={onRules} />
        <View style={{ flex: 1, minWidth: 0 }}>
          {wide ? (
            <>
              <Wordmark size={17} />
              <T
                numberOfLines={1}
                style={mine && !over ? { fontFamily: FONTS.money, fontSize: 11, letterSpacing: 1 } : undefined}
                v={mine && !over ? undefined : 'small'}
                color={mine && !over ? th.accent : th.inkSoft}
              >
                {mine && !over ? `YOUR TURN · ${state.turnNo}` : `${headline} · ${detail}`}
              </T>
            </>
          ) : (
            <>
              {/* A long rival name shortens itself; "'s turn" always stays readable. */}
              <View style={{ flexDirection: 'row', minWidth: 0 }}>
                <T numberOfLines={1} style={[lead, { flexShrink: 1 }]} color={mine && !over ? th.accent : th.ink}>
                  {rival ? who : headline}
                </T>
                {rival && <T numberOfLines={1} style={[lead, { flexShrink: 0 }]} color={th.ink}>’s turn</T>}
              </View>
              <T v="small" color={th.inkSoft} numberOfLines={1}>{detail}</T>
            </>
          )}
        </View>
        {me && <Money amount={me.cash} v="ingot" size={narrow ? 12 : 13} style={{ alignSelf: 'center' }} />}
        <Tabs
          kind="switch"
          compact={narrow}
          value={view}
          onChange={onView}
          items={[
            { key: 'map', label: 'Show the map', icon: MapIcon, flag: mine && !over && view !== 'map' },
            { key: 'exchange', label: 'Show the exchange', icon: ChartColumn },
          ]}
        />
      </View>
      <Rule kind="rail" />
    </View>
  );
}

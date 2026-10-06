// The splash's "How will you play?" column: a gold New bot game card, an iron Continue card for a
// saved local game, and The Saloon, the online lobby (host, your rooms, search or join by code).
import { useEffect, useRef } from 'react';
import {
  ActivityIndicator, Animated, Easing, Platform, Pressable, ScrollView, TextInput, View,
} from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import {
  Bot, ChevronRight, Clock, Home as HouseIcon, Trash2,
} from 'lucide-react-native';
import { Button, Plate, T } from '../../theme/ui';
import { FONTS, GOLD } from '../../theme/tokens';
import { netWorth } from '../../game/rules';
import { TILES } from '../../game/data';
import { myTurnAt } from '../../net/online';

const NATIVE = Platform.OS !== 'web';
const LIVE = '#7FB069'; // "in play" green, only on the splash
const MUTED = '#8C7F66';
const SOFT = '#B7A98C';
const CREAM = '#EDE4D0';

const ordinal = (n) => n + (['th', 'st', 'nd', 'rd'][(n % 100 > 10 && n % 100 < 14) ? 0 : (n % 10 < 4 ? n % 10 : 0)] || 'th');
const compactMoney = (n) => (Math.abs(n) >= 1000 ? `$${(n / 1000).toFixed(n >= 100000 ? 0 : 1)}k` : `$${n}`);

// Wrapped in a View: on web a bare icon <svg> is position:static, so the Plate's absolutely
// positioned GoldFill/IronFill would paint over it.
function Chevron({ color }) {
  return <View><ChevronRight size={28} color={color} strokeWidth={2} /></View>;
}

function Ring({
  children, color, width = 1, size = 56,
}) {
  return (
    <View style={{
      width: size, height: size, borderRadius: size / 2, borderWidth: width, borderColor: color, alignItems: 'center', justifyContent: 'center',
    }}
    >
      {children}
    </View>
  );
}

// A light sweep across the gold card every few seconds.
function Shine({ width }) {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(t, {
        toValue: 1, duration: 2700, easing: Easing.inOut(Easing.quad), useNativeDriver: NATIVE,
      }),
      Animated.delay(1800),
      Animated.timing(t, { toValue: 0, duration: 0, useNativeDriver: NATIVE }),
    ]));
    loop.start();
    return () => loop.stop();
  }, []);
  const band = Math.max(80, width * 0.3);
  const x = t.interpolate({ inputRange: [0, 1], outputRange: [-band * 1.4, width * 1.3] });
  return (
    <Animated.View pointerEvents="none" style={{ position: 'absolute', top: 0, bottom: 0, width: band, transform: [{ translateX: x }] }}>
      <Svg width={band} height="100%">
        <Defs>
          <LinearGradient id="shine" x1="0" y1="0" x2="1" y2="0.2">
            <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0" />
            <Stop offset="0.5" stopColor="#FFFFFF" stopOpacity="0.55" />
            <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
          </LinearGradient>
        </Defs>
        <Rect width={band} height="100%" fill="url(#shine)" />
      </Svg>
    </Animated.View>
  );
}

function CardPress({
  label, hint, onPress, children, disabled,
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={hint}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => ({ transform: [{ translateY: pressed ? 2 : 0 }], opacity: disabled ? 0.5 : 1 })}
    >
      {children}
    </Pressable>
  );
}

export function NewGameCard({ onPress, width, compact }) {
  return (
    <CardPress label="New bot game" hint="Start fresh against the house and pick your rivals" onPress={onPress}>
      <View style={{
        shadowColor: '#E4A548', shadowOpacity: 0.3, shadowRadius: 22, shadowOffset: { width: 0, height: 10 }, elevation: 10,
      }}
      >
        <Plate material="gold" pad={0} style={{ paddingVertical: compact ? 18 : 22, paddingHorizontal: compact ? 16 : 24, flexDirection: 'row', alignItems: 'center', gap: compact ? 12 : 18 }}>
          <Shine width={width} />
          <Ring color={GOLD.ink} width={2} size={compact ? 46 : 56}><Bot size={compact ? 24 : 30} color={GOLD.ink} strokeWidth={1.8} /></Ring>
          <View style={{ flex: 1, minWidth: 0 }}>
            <T style={{ fontFamily: FONTS.display, fontSize: compact ? 18 : 22, letterSpacing: compact ? 1.2 : 1.8 }} color={GOLD.ink}>NEW BOT GAME</T>
            <T style={{ fontFamily: FONTS.ui, fontSize: 15, marginTop: 3 }} color="#3A2A0C">Deal in now against the house.</T>
          </View>
          <Chevron color={GOLD.ink} />
        </Plate>
      </View>
    </CardPress>
  );
}

// A friend's room link (…/?room=ABCD) lands here: one tap to sit down at their table under your alias.
export function InviteCard({
  code, name, onName, onJoin, busy, compact,
}) {
  return (
    <View style={{
      shadowColor: '#E4A548', shadowOpacity: 0.3, shadowRadius: 22, shadowOffset: { width: 0, height: 10 }, elevation: 10,
    }}
    >
      <Plate material="gold" pad={0} style={{ paddingVertical: compact ? 16 : 20, paddingHorizontal: compact ? 16 : 24, gap: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: compact ? 12 : 18 }}>
          <Ring color={GOLD.ink} width={2} size={compact ? 46 : 56}><HouseIcon size={compact ? 22 : 28} color={GOLD.ink} strokeWidth={1.8} /></Ring>
          <View style={{ flex: 1, minWidth: 0 }}>
            <T style={{ fontFamily: FONTS.engraved, fontSize: 12, letterSpacing: 2.4 }} color="#3A2A0C">YOU'RE INVITED</T>
            <T style={{ fontFamily: FONTS.display, fontSize: compact ? 20 : 24, letterSpacing: 1.6 }} color={GOLD.ink}>TABLE {code}</T>
          </View>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <TextInput
            value={name}
            onChangeText={onName}
            placeholder="Your name"
            placeholderTextColor="#6B4C15"
            maxLength={16}
            autoCorrect={false}
            accessibilityLabel="Your name at the table"
            style={{
              flex: 1, minHeight: 44, paddingHorizontal: 12, fontFamily: FONTS.uiMedium, fontSize: 16, color: GOLD.ink,
              backgroundColor: 'rgba(255,240,200,0.55)', borderWidth: 1, borderColor: GOLD.burnish,
            }}
          />
          <Button title="Join" kind="iron" onPress={onJoin} disabled={busy || !name.trim()} />
        </View>
      </Plate>
    </View>
  );
}

// Where the saved local game stands: your rank by net worth, your worth, and how much of the
// town has been dealt (the game ends as the plots run out, so that is its progress).
function standing(saved, myId) {
  const seat = Math.max(0, saved.players.findIndex((p) => p.id === myId));
  const worths = saved.players.map((_, i) => netWorth(saved, i));
  const rank = 1 + worths.filter((w) => w > worths[seat]).length;
  const progress = Math.min(1, 1 - (saved.pool?.length ?? TILES.length) / TILES.length);
  return { rank, worth: worths[seat], progress };
}

export function ContinueCard({
  saved, myId, onPress, compact,
}) {
  const { rank, worth, progress } = standing(saved, myId);
  const detail = `Turn ${saved.turnNo} · you're ${ordinal(rank)} · ${compactMoney(worth)}`;
  return (
    <CardPress label="Continue bot game" hint={detail} onPress={onPress}>
      <Plate material="iron" pad={0} style={{ paddingVertical: 18, paddingHorizontal: compact ? 16 : 24, flexDirection: 'row', alignItems: 'center', gap: compact ? 12 : 18 }}>
        <Ring color={GOLD.leaf} size={compact ? 46 : 56}><Clock size={compact ? 24 : 30} color={GOLD.bright} strokeWidth={1.6} /></Ring>
        <View style={{ flex: 1, minWidth: 0 }}>
          <View style={{
            flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap',
          }}
          >
            <T style={{ fontFamily: FONTS.display, fontSize: compact ? 16 : 20, letterSpacing: compact ? 1 : 1.6 }} color={CREAM}>
              {compact ? 'CONTINUE' : 'CONTINUE BOT GAME'}
            </T>
            <View style={{ backgroundColor: LIVE, paddingHorizontal: 7, paddingVertical: 2 }}>
              <T style={{ fontFamily: FONTS.engraved, fontSize: 10, letterSpacing: 1.8 }} color="#0B0907">IN PLAY</T>
            </View>
          </View>
          <T style={{ fontFamily: FONTS.ui, fontSize: 14, marginTop: 3 }} color={SOFT}>{detail}</T>
          <View style={{ height: 4, backgroundColor: '#14100C', marginTop: 8 }}>
            <Svg width={`${Math.round(progress * 100)}%`} height={4}>
              <Defs>
                <LinearGradient id="prog" x1="0" y1="0" x2="1" y2="0">
                  <Stop offset="0" stopColor={GOLD.deep} />
                  <Stop offset="1" stopColor={GOLD.bright} />
                </LinearGradient>
              </Defs>
              <Rect width="100%" height={4} fill="url(#prog)" />
            </Svg>
          </View>
        </View>
        <Chevron color={GOLD.leaf} />
      </Plate>
    </CardPress>
  );
}

function StatusDot({ color }) {
  return (
    <View style={{
      width: 10, height: 10, borderRadius: 5, backgroundColor: color, shadowColor: color, shadowOpacity: 0.9, shadowRadius: 5, shadowOffset: { width: 0, height: 0 },
    }}
    />
  );
}

function RoomRow({
  row, uid, onOpen, onDelete,
}) {
  const others = row.lobby.players.filter((p) => p.id !== uid);
  const playing = row.status === 'playing';
  const mine = myTurnAt(row, uid);
  const color = playing ? LIVE : GOLD.bright;
  const status = playing ? 'IN PLAY' : 'WAITING';
  const detail = playing
    ? (mine ? 'your move' : 'waiting on others')
    : `${row.lobby.players.length}/6 seated · code ${row.code}`;
  const who = others.length ? `with ${others.map((p) => p.name).join(', ')}` : null;
  return (
    <View style={{
      flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 11, paddingHorizontal: 4, borderBottomWidth: 1, borderColor: 'rgba(92,64,18,0.6)',
    }}
    >
      <StatusDot color={color} />
      <View style={{ flex: 1, minWidth: 0 }}>
        <T style={{ fontFamily: FONTS.engraved, fontSize: 14, letterSpacing: 0.6 }} color={CREAM} numberOfLines={1}>
          {row.title || `Table ${row.code}`}
        </T>
        <T style={{ fontFamily: FONTS.ui, fontSize: 13 }} color={SOFT} numberOfLines={1}>
          <T style={{ fontFamily: FONTS.ui, fontSize: 13 }} color={mine ? LIVE : color}>{status}</T>
          {` · ${detail}${who && playing ? ` · ${who}` : ''}`}
        </T>
      </View>
      {row.lobby.host === uid && (
        <Button iconOnly icon={Trash2} color={MUTED} label={`Close table ${row.title || row.code}`} onPress={onDelete} />
      )}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${playing ? 'Rejoin' : 'Open'} ${row.title || `table ${row.code}`}`}
        onPress={onOpen}
        style={({ pressed }) => ({
          minHeight: 36, justifyContent: 'center', paddingHorizontal: 10, borderWidth: 1, borderColor: GOLD.deep,
          backgroundColor: pressed ? GOLD.bright : 'transparent',
        })}
      >
        {({ pressed }) => (
          <T style={{ fontFamily: FONTS.display, fontSize: 11, letterSpacing: 1.5 }} color={pressed ? GOLD.ink : GOLD.bright}>
            {playing ? 'REJOIN' : 'OPEN'}
          </T>
        )}
      </Pressable>
    </View>
  );
}

// The Saloon: host a room, find one of your tables by name or code, or join any table by its code.
export function SaloonPanel({
  enabled, tables, query, onQuery, busy, err, onHost, onJoin, onOpen, onDelete, compact,
}) {
  const q = query.trim();
  const code = /^[A-Za-z]{4}$/.test(q) ? q.toUpperCase() : null;
  const rows = tables ? tables.rows.filter((r) => !q
    || `${r.title || ''} ${r.code}`.toLowerCase().includes(q.toLowerCase())) : [];
  const knownCode = code && tables?.rows.some((r) => r.code === code);

  return (
    <Plate style={{ paddingTop: 20, paddingHorizontal: compact ? 14 : 20, paddingBottom: 12, gap: 12 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: compact ? 10 : 12 }}>
        <HouseIcon size={compact ? 24 : 30} color={GOLD.bright} strokeWidth={1.6} />
        <View style={{ flex: 1 }}>
          <T style={{ fontFamily: FONTS.display, fontSize: compact ? 16 : 20, letterSpacing: compact ? 1 : 1.6 }} color={CREAM}>
            {compact ? 'THE SALOON' : 'THE SALOON · LOBBY'}
          </T>
          <T style={{ fontFamily: FONTS.ui, fontSize: 14 }} color={SOFT}>Play with friends on their own phones.</T>
        </View>
        {enabled && <Button title="+ Host" compact onPress={onHost} disabled={busy} />}
      </View>

      {!enabled ? (
        <T v="small" color={SOFT}>Online play isn't set up in this build.</T>
      ) : (
        <>
          <View style={{ borderBottomWidth: 1, borderColor: GOLD.edge, flexDirection: 'row' }}>
            <View style={{ paddingVertical: 8, paddingHorizontal: 14, marginBottom: -1, borderBottomWidth: 2, borderColor: GOLD.bright }}>
              <T style={{ fontFamily: FONTS.engraved, fontSize: 12, letterSpacing: 2 }} color={GOLD.bright}>MY ROOMS</T>
            </View>
          </View>
          <TextInput
            value={query}
            onChangeText={onQuery}
            placeholder="Search rooms or enter a room code…"
            placeholderTextColor={MUTED}
            autoCorrect={false}
            autoCapitalize="none"
            accessibilityLabel="Search rooms or enter a room code"
            returnKeyType="go"
            onSubmitEditing={() => code && !knownCode && onJoin(code)}
            style={{
              minHeight: 44, paddingHorizontal: 12, fontFamily: FONTS.ui, fontSize: 15, color: CREAM,
              backgroundColor: '#0B0907', borderWidth: 1, borderColor: GOLD.edge,
            }}
          />
          <ScrollView style={{ maxHeight: 300 }} nestedScrollEnabled>
            {code && !knownCode && (
              <View style={{
                flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 11, paddingHorizontal: 4, borderBottomWidth: 1, borderColor: 'rgba(92,64,18,0.6)',
              }}
              >
                <StatusDot color={GOLD.bright} />
                <View style={{ flex: 1 }}>
                  <T style={{ fontFamily: FONTS.engraved, fontSize: 14, letterSpacing: 2 }} color={CREAM}>ROOM {code}</T>
                  <T style={{ fontFamily: FONTS.ui, fontSize: 13 }} color={SOFT}>Join a friend's table by its code</T>
                </View>
                <Button title="Join" kind="ghost" compact disabled={busy} onPress={() => onJoin(code)} />
              </View>
            )}
            {rows.map((r) => (
              <RoomRow key={r.code} row={r} uid={tables.uid} onOpen={() => onOpen(r)} onDelete={() => onDelete(r)} />
            ))}
            {tables && !rows.length && !code && (
              <T style={{ fontFamily: FONTS.accent, fontSize: 17, paddingVertical: 18, paddingHorizontal: 4 }} color={MUTED}>
                {q ? 'No rooms match. Try another name, or a 4-letter code.' : 'No tables yet. Host one, or type a friend\'s room code.'}
              </T>
            )}
            {!tables && <ActivityIndicator color={GOLD.bright} style={{ marginVertical: 16 }} />}
          </ScrollView>
          {busy && tables && <ActivityIndicator color={GOLD.bright} />}
        </>
      )}
      {err && <T v="small" color="#D98A7E">{err}</T>}
    </Plate>
  );
}

export function FooterQuote() {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 6 }}>
      <View style={{ flex: 1, height: 1, backgroundColor: GOLD.edge, opacity: 0.8 }} />
      <T style={{ fontFamily: FONTS.accent, fontSize: 16, textAlign: 'center', flexShrink: 1 }} color={MUTED}>
        Fortunes are made on the rails, and lost there too.
      </T>
      <View style={{ flex: 1, height: 1, backgroundColor: GOLD.edge, opacity: 0.8 }} />
    </View>
  );
}


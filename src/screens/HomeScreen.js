import { useEffect, useState } from 'react';
import {
  ActivityIndicator, BackHandler, KeyboardAvoidingView, Platform, Pressable, ScrollView, TextInput, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Bot, ChevronLeft, ChevronRight, Plus, User, Users, X,
} from 'lucide-react-native';
import { useTheme } from '../theme/theme';
import {
  Button, Plate, Rule, T,
} from '../theme/ui';
import {
  AVATARS, FONTS, MIN_TARGET, TYCOON_TITLES,
} from '../theme/tokens';
import Portrait from '../components/Portrait';
import { BOT_NAMES } from '../game/data';
import { newGame } from '../game/engine';
import { loadLocalGame } from '../store/storage';
import {
  createRoom, ensureSession, fetchRoom, joinRoom, listMyRooms, myTurnAt, onlineEnabled,
} from '../net/online';
import { feel } from '../feel/feel';
import { Seal, Wordmark } from '../theme/brand';

const DEFAULT_SEATS = [{ bot: true, name: '' }, { bot: true, name: '' }];

function Field({ value, onChangeText, placeholder, style, ...rest }) {
  const th = useTheme();
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={th.inkSoft}
      style={[{
        minHeight: MIN_TARGET, borderWidth: 1, borderColor: th.field, paddingHorizontal: 12,
        color: th.ink, fontFamily: FONTS.ui, fontSize: 16, backgroundColor: th.ground,
      }, style]}
      {...rest}
    />
  );
}

function SectionTitle({ children, aside }) {
  const th = useTheme();
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
      <T v="title" style={{ fontSize: 16 }}>{children}</T>
      {aside ? <T v="small" color={th.inkSoft}>{aside}</T> : null}
    </View>
  );
}

// One of the two ways into a game, as a big tappable plate on the first screen.
function PathCard({
  icon: Icon, title, blurb, note, noteColor, onPress, disabled,
}) {
  const th = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityHint={blurb}
      accessibilityState={{ disabled: !!disabled }}
      disabled={!!disabled}
      onPress={() => { feel.select(); onPress(); }}
      style={({ pressed }) => ({ opacity: disabled ? 0.45 : pressed ? 0.75 : 1 })}
    >
      <Plate style={{ flexDirection: 'row', alignItems: 'center', gap: 14, minHeight: 96 }}>
        <View style={{
          width: 52, height: 52, borderRadius: 26, borderWidth: 1, borderColor: th.accent,
          alignItems: 'center', justifyContent: 'center',
        }}
        >
          <Icon size={26} color={th.money} strokeWidth={1.5} />
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <T v="title" style={{ fontSize: 18 }}>{title}</T>
          <T v="small" color={th.inkSoft}>{blurb}</T>
          {note ? <T v="small" color={noteColor || th.money} style={{ marginTop: 2 }}>{note}</T> : null}
        </View>
        <ChevronRight size={22} color={th.inkSoft} strokeWidth={1.5} />
      </Plate>
    </Pressable>
  );
}

function PathHeader({ title, onBack }) {
  return (
    <>
      <View style={{ flexDirection: 'row', alignItems: 'center', minHeight: 48 }}>
        <Button iconOnly icon={ChevronLeft} label="Back" onPress={onBack} />
        <T v="title" style={{ flex: 1 }}>{title}</T>
      </View>
      <Rule kind="gilt" />
    </>
  );
}

// One of my online tables: who is there, and whether it is waiting on me.
function TableRow({ row, uid, onOpen }) {
  const th = useTheme();
  const names = row.lobby.players.filter((p) => p.id !== uid).map((p) => p.name);
  const mine = myTurnAt(row, uid);
  const status = row.status === 'lobby' ? 'In the lobby' : mine ? 'Your move' : 'Waiting on others';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${row.title || 'Table'} ${row.code}, ${status}`}
      onPress={onOpen}
      style={({ pressed }) => ({
        flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: MIN_TARGET + 8,
        borderTopWidth: 1, borderColor: th.rule, opacity: pressed ? 0.6 : 1,
      })}
    >
      <T v="plate" style={{ letterSpacing: 3, width: 64 }}>{row.code}</T>
      <View style={{ flex: 1 }}>
        {row.title ? <T v="strong" numberOfLines={1}>{row.title}</T> : null}
        <T v={row.title ? 'small' : 'body'} color={row.title ? th.inkSoft : undefined} numberOfLines={1}>
          {names.length ? `with ${names.join(', ')}` : 'Just you so far'}
        </T>
        <T v="small" color={mine ? th.money : th.inkSoft}>{status}</T>
      </View>
      {mine && <View style={{ width: 8, height: 8, backgroundColor: th.money, transform: [{ rotate: '45deg' }] }} />}
    </Pressable>
  );
}

export default function HomeScreen({
  profile, onProfile, onStartLocal, onResumeLocal, onLobby, joinCode,
}) {
  const th = useTheme();
  // null = the first screen, where you pick 'online' (friends) or 'local' (bots / pass-and-play).
  // A room link opens straight onto the online path with its code filled in.
  const [path, setPath] = useState(joinCode ? 'online' : null);
  const [saved, setSaved] = useState(null);
  const [code, setCode] = useState(joinCode || '');
  const [title, setTitle] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);
  const [tables, setTables] = useState(null); // { uid, rows } once signed in
  const seats = profile.seats || DEFAULT_SEATS;

  useEffect(() => {
    loadLocalGame().then((s) => setSaved(s && s.phase !== 'over' ? s : null));
  }, []);

  useEffect(() => {
    if (!onlineEnabled) return;
    Promise.all([ensureSession(), listMyRooms()])
      .then(([uid, rows]) => setTables({ uid, rows }))
      .catch((e) => setErr(e.message));
  }, []);

  useEffect(() => {
    if (!path) return undefined;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => { setPath(null); return true; });
    return () => sub.remove();
  }, [path]);

  const setSeats = (next) => onProfile({ ...profile, seats: next });
  const setSeat = (i, patch) => setSeats(seats.map((s, j) => (j === i ? { ...s, ...patch } : s)));

  const startLocal = () => {
    const players = [
      { id: profile.id, name: profile.name.trim() || 'Tycoon', avatar: profile.avatar, bot: false },
      ...seats.map((s, i) => ({
        id: `seat-${i + 2}`,
        name: s.bot ? BOT_NAMES[i] : (s.name.trim() || `Tycoon ${i + 2}`),
        avatar: (profile.avatar + i + 1) % AVATARS.length,
        bot: s.bot,
      })),
    ];
    feel.build();
    onStartLocal(newGame(players));
  };

  const online = async (fn) => {
    setBusy(true);
    setErr(null);
    try {
      const uid = await ensureSession();
      const row = await fn();
      if (!row) throw new Error('That table is gone');
      onLobby(row, uid);
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };

  const myMoves = tables ? tables.rows.filter((r) => myTurnAt(r, tables.uid)).length : 0;
  const back = () => { setErr(null); setPath(null); };

  const tycoon = (
    <Plate>
      <SectionTitle>Your tycoon</SectionTitle>
      <Field value={profile.name} onChangeText={(name) => onProfile({ ...profile, name })} placeholder="Your name" maxLength={16} />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }}>
        {AVATARS.map((_, i) => (
          <Pressable
            key={i}
            accessibilityLabel={TYCOON_TITLES[i]}
            onPress={() => { feel.select(); onProfile({ ...profile, avatar: i }); }}
            style={{ minWidth: MIN_TARGET, minHeight: MIN_TARGET, alignItems: 'center', justifyContent: 'center' }}
          >
            <Portrait index={i} size={42} ring={profile.avatar === i} />
          </Pressable>
        ))}
      </View>
      <T v="accent" color={th.money} style={{ marginTop: 6, textAlign: 'center', fontSize: 15 }}>
        {TYCOON_TITLES[profile.avatar % TYCOON_TITLES.length]}
      </T>
    </Plate>
  );

  let body;
  let footer = null;
  if (path === 'online') {
    body = (
      <>
        <Plate>
          <SectionTitle>Host a room</SectionTitle>
          <T v="small" color={th.inkSoft} style={{ marginBottom: 10 }}>
            Get a 4-letter code to send your friends. Add bots to fill empty seats.
          </T>
          <Field
            value={title}
            onChangeText={setTitle}
            placeholder="Room name (optional)"
            maxLength={32}
            accessibilityLabel="Room name"
            style={{ marginBottom: 10 }}
          />
          <Button title="Host a room" kind="iron" onPress={() => online(() => createRoom(profile, title))} disabled={busy} />
        </Plate>
        <Plate>
          <SectionTitle>Join a room</SectionTitle>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Field
              value={code}
              onChangeText={(t) => setCode(t.toUpperCase())}
              placeholder="Room code"
              autoCapitalize="characters"
              autoCorrect={false}
              maxLength={4}
              style={{ flex: 1, letterSpacing: 4 }}
            />
            <Button
              title="Join"
              kind="ghost"
              disabled={busy || code.trim().length !== 4}
              onPress={() => online(() => joinRoom(code, profile))}
            />
          </View>
        </Plate>
        {busy && <ActivityIndicator color={th.ink} />}
        {err && <T v="small" color={th.jewel.carnelianText}>{err}</T>}
        {tables && tables.rows.length > 0 && (
          <Plate>
            <SectionTitle aside={myMoves ? `${myMoves} waiting on you` : null}>Your tables</SectionTitle>
            {tables.rows.map((r) => (
              <TableRow key={r.code} row={r} uid={tables.uid} onOpen={() => online(() => fetchRoom(r.code))} />
            ))}
          </Plate>
        )}
      </>
    );
  } else if (path === 'local') {
    body = (
      <Plate>
        <SectionTitle aside={`${seats.length + 1} tycoons`}>Your table</SectionTitle>
        <T v="small" color={th.inkSoft} style={{ marginBottom: 4 }}>
          Play bots, or pass the phone around. Tap a seat's icon to switch between bot and human. 2–6 tycoons.
        </T>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: MIN_TARGET }}>
          <Portrait index={profile.avatar} size={32} />
          <T v="body" style={{ flex: 1 }}>{profile.name || 'Tycoon'} <T v="body" color={th.inkFaint}>· you</T></T>
        </View>
        {seats.map((s, i) => (
          <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, borderTopWidth: 1, borderColor: th.rule }}>
            <Button
              iconOnly
              icon={s.bot ? Bot : User}
              color={th.inkSoft}
              label={s.bot ? 'Bot seat — tap for human' : 'Human seat — tap for bot'}
              onPress={() => { feel.select(); setSeat(i, { bot: !s.bot }); }}
              style={{ marginLeft: -6 }}
            />
            {s.bot ? (
              <T v="body" style={{ flex: 1 }}>{BOT_NAMES[i]} <T v="body" color={th.inkFaint}>· bot</T></T>
            ) : (
              <Field
                value={s.name}
                onChangeText={(name) => setSeat(i, { name })}
                placeholder={`Tycoon ${i + 2}`}
                maxLength={16}
                style={{ flex: 1 }}
              />
            )}
            <Button
              iconOnly
              icon={X}
              label="Remove seat"
              disabled={seats.length <= 1}
              onPress={() => setSeats(seats.filter((_, j) => j !== i))}
            />
          </View>
        ))}
        {seats.length < 5 && (
          <Button
            title="Add a seat"
            kind="ghost"
            icon={Plus}
            onPress={() => setSeats([...seats, { bot: true, name: '' }])}
            style={{ marginTop: 8 }}
          />
        )}
        {saved && (
          <Button
            title={`Resume local game · turn ${saved.turnNo}`}
            kind="ghost"
            onPress={() => onResumeLocal(saved)}
            style={{ marginTop: 8 }}
          />
        )}
      </Plate>
    );
    footer = <Button title="Deal a local game" onPress={startLocal} />;
  } else {
    body = (
      <>
        <View style={{ alignItems: 'center', paddingTop: 8, gap: 6 }}>
          <View style={{ borderRadius: 40, shadowColor: th.gold.leaf, shadowOpacity: 0.25, shadowRadius: 12, shadowOffset: { width: 0, height: 8 } }}>
            <Seal kind="coin" size={80} />
          </View>
          <Wordmark size={34} align="center" />
          <T v="accent" color={th.inkSoft} style={{ fontSize: 16 }}>A frontier rail town, 1881</T>
        </View>
        <Rule kind="ornament" />
        {tycoon}
        <T v="label" color={th.inkSoft} style={{ marginTop: 4 }}>HOW WILL YOU PLAY?</T>
        <PathCard
          icon={Users}
          title="Play with friends"
          blurb={onlineEnabled ? 'Host or join an online room. Everyone plays on their own phone.' : 'Online play is not set up in this build.'}
          note={myMoves ? `Your move at ${myMoves} table${myMoves > 1 ? 's' : ''}` : null}
          onPress={() => setPath('online')}
          disabled={!onlineEnabled}
        />
        <PathCard
          icon={Bot}
          title="Play with bots"
          blurb="On this phone, against bots. Friends in the room can take a seat and pass the phone."
          note={saved ? `Game in progress · turn ${saved.turnNo}` : null}
          onPress={() => setPath('local')}
        />
        {err && <T v="small" color={th.jewel.carnelianText}>{err}</T>}
      </>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: th.ground }}>
      {path && <PathHeader title={path === 'online' ? 'Play with friends' : 'Play with bots'} onBack={back} />}
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingTop: path ? 16 : 8, paddingBottom: 24, gap: 16 }} keyboardShouldPersistTaps="handled">
          {body}
        </ScrollView>
        {footer && (
          <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12, borderTopWidth: 1, borderColor: th.rule }}>
            {footer}
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

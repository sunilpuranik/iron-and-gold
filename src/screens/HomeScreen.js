import { useEffect, useState } from 'react';
import {
  BackHandler, KeyboardAvoidingView, Platform, ScrollView, TextInput, useWindowDimensions, View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Bot, ChevronLeft, Plus, User, X,
} from 'lucide-react-native';
import { useTheme } from '../theme/theme';
import {
  Button, Plate, Rule, T, confirmAction,
} from '../theme/ui';
import {
  AVATARS, FONTS, GOLD, MIN_TARGET,
} from '../theme/tokens';
import Portrait from '../components/Portrait';
import FrontierScene from '../components/home/FrontierScene';
import WantedPoster from '../components/home/WantedPoster';
import {
  ContinueCard, FooterQuote, NewGameCard, SaloonPanel,
} from '../components/home/PlayCards';
import { BOT_NAMES } from '../game/data';
import { newGame } from '../game/engine';
import { loadLocalGame } from '../store/storage';
import {
  createRoom, deleteRoom, ensureSession, fetchRoom, joinRoom, listMyRooms, onlineEnabled,
} from '../net/online';
import { feel } from '../feel/feel';

const DEFAULT_SEATS = [{ bot: true, name: '' }, { bot: true, name: '' }];
const WIDE = 900; // poster and play column side by side from here up

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

// Home is the "Splash — Gold Rush" design: a frontier scene, a wanted poster for who you are, and
// three ways in. Two of them open a short setup screen ('host' a room, or seat a 'local' game).
export default function HomeScreen({
  profile, onProfile, onStartLocal, onResumeLocal, onLobby, joinCode, notice,
}) {
  const th = useTheme();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const [path, setPath] = useState(null); // null | 'host' | 'local'
  const [saved, setSaved] = useState(null);
  // A room link (…/?room=ABCD) lands with the code in the Saloon's search, ready to join.
  const [query, setQuery] = useState(joinCode || '');
  const [title, setTitle] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(notice || null);
  const [tables, setTables] = useState(null); // { uid, rows } once signed in
  const seats = profile.seats || DEFAULT_SEATS;
  const wide = width >= WIDE;
  const narrow = width < 440;

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

  const closeTable = (r) => confirmAction({
    title: `Close ${r.title ? `"${r.title}"` : `table ${r.code}`}?`,
    message: 'The room is deleted for everyone at the table. This cannot be undone.',
    ok: 'Close table',
    onOk: async () => {
      setErr(null);
      try {
        await deleteRoom(r.code);
        setTables((t) => ({ ...t, rows: t.rows.filter((x) => x.code !== r.code) }));
      } catch (e) {
        setErr(e.message);
      }
    },
  });

  const back = () => { setErr(null); setPath(null); };

  // ---- setup screens

  if (path) {
    let body;
    let footer = null;
    if (path === 'host') {
      body = (
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
          {err && <T v="small" color={th.jewel.carnelianText} style={{ marginTop: 8 }}>{err}</T>}
        </Plate>
      );
    } else {
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
        </Plate>
      );
      footer = <Button title="Deal a local game" onPress={startLocal} />;
    }
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: th.ground }}>
        <PathHeader title={path === 'host' ? 'Host a room' : 'New bot game'} onBack={back} />
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }} keyboardShouldPersistTaps="handled">
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

  // ---- the splash

  const sceneH = Math.max(440, Math.min(560, height * 0.68)) + insets.top;
  const column = wide ? Math.min(1100, width) / 2 - 32 : width - 40;

  const poster = (
    <WantedPoster
      name={profile.name}
      onName={(name) => onProfile({ ...profile, name })}
      avatar={profile.avatar}
      onAvatar={(avatar) => onProfile({ ...profile, avatar })}
      compact={narrow}
    />
  );
  const play = (
    <View style={{ gap: 18, paddingTop: wide ? 34 : 8 }}>
      <T style={{ fontFamily: FONTS.engraved, fontSize: 13, letterSpacing: 4.4 }} color={GOLD.leaf}>HOW WILL YOU PLAY?</T>
      <NewGameCard width={column} compact={narrow} onPress={() => { feel.select(); setPath('local'); }} />
      {saved && <ContinueCard saved={saved} myId={profile.id} compact={narrow} onPress={() => onResumeLocal(saved)} />}
      <SaloonPanel
        enabled={onlineEnabled}
        compact={narrow}
        tables={tables}
        query={query}
        onQuery={setQuery}
        busy={busy}
        err={err}
        onHost={() => { setErr(null); setPath('host'); }}
        onJoin={(code) => online(() => joinRoom(code, profile))}
        onOpen={(r) => online(() => fetchRoom(r.code))}
        onDelete={closeTable}
      />
      <FooterQuote />
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: th.ground }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 64 + insets.bottom }}
        >
          <FrontierScene width={width} height={sceneH} topInset={insets.top} />
          <View style={{
            marginTop: -26, paddingHorizontal: 20, width: '100%', maxWidth: 1100, alignSelf: 'center',
            flexDirection: wide ? 'row' : 'column', gap: 24, alignItems: wide ? 'flex-start' : 'stretch',
          }}
          >
            <View style={wide ? { flex: 1 } : null}>{poster}</View>
            <View style={wide ? { flex: 1 } : null}>{play}</View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

import { useEffect, useState } from 'react';
import {
  ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, TextInput, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bot, Plus, User, X } from 'lucide-react-native';
import { useTheme } from '../theme/theme';
import {
  Button, Card, DoubleRule, IconButton, T,
} from '../theme/ui';
import {
  AVATARS, FONTS, MIN_TARGET, TYCOON_TITLES,
} from '../theme/tokens';
import Avatar from '../components/Avatar';
import { BOT_NAMES } from '../game/data';
import { newGame } from '../game/engine';
import { loadLocalGame } from '../store/storage';
import { createRoom, joinRoom, onlineEnabled } from '../net/online';
import { feel } from '../feel/feel';

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
        minHeight: MIN_TARGET, borderWidth: 1, borderColor: th.ink, paddingHorizontal: 10,
        color: th.ink, fontFamily: FONTS.ui, fontSize: 16, backgroundColor: th.paper,
      }, style]}
      {...rest}
    />
  );
}

function SectionTitle({ children }) {
  return <T v="title" style={{ marginBottom: 8 }}>{children}</T>;
}

export default function HomeScreen({ profile, onProfile, onStartLocal, onResumeLocal, onLobby }) {
  const th = useTheme();
  const [saved, setSaved] = useState(null);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);
  const seats = profile.seats || DEFAULT_SEATS;

  useEffect(() => {
    loadLocalGame().then((s) => setSaved(s && s.phase !== 'over' ? s : null));
  }, []);

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
      const row = await fn();
      onLobby(row);
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: th.paper }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }} keyboardShouldPersistTaps="handled">
          <View style={{ alignItems: 'center', paddingTop: 12 }}>
            <T v="display" style={{ fontSize: 40 }}>{'Iron & Gold'}</T>
            <T v="accent" color={th.inkSoft}>A frontier rail town, 1881</T>
          </View>
          <DoubleRule />

          <Card>
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
                  <Avatar index={i} size={46} ring={profile.avatar === i} />
                </Pressable>
              ))}
            </View>
            <T v="accent" color={th.inkSoft} style={{ marginTop: 6, textAlign: 'center' }}>
              {TYCOON_TITLES[profile.avatar % TYCOON_TITLES.length]}
            </T>
          </Card>

          <Card>
            <SectionTitle>Local table</SectionTitle>
            <T v="small" color={th.inkSoft} style={{ marginBottom: 8 }}>
              Pass-and-play on this phone. 2–6 tycoons.
            </T>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: MIN_TARGET }}>
              <Avatar index={profile.avatar} size={36} />
              <T v="strong" style={{ flex: 1 }}>{profile.name || 'Tycoon'} (you)</T>
            </View>
            {seats.map((s, i) => (
              <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 }}>
                <IconButton
                  icon={s.bot ? Bot : User}
                  label={s.bot ? 'Bot seat — tap for human' : 'Human seat — tap for bot'}
                  onPress={() => { feel.select(); setSeat(i, { bot: !s.bot }); }}
                />
                {s.bot ? (
                  <T v="body" style={{ flex: 1 }}>{BOT_NAMES[i]} <T v="small" color={th.inkSoft}>(bot)</T></T>
                ) : (
                  <Field
                    value={s.name}
                    onChangeText={(name) => setSeat(i, { name })}
                    placeholder={`Tycoon ${i + 2}`}
                    maxLength={16}
                    style={{ flex: 1 }}
                  />
                )}
                <IconButton
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
                kind="tertiary"
                icon={Plus}
                onPress={() => setSeats([...seats, { bot: true, name: '' }])}
                style={{ marginTop: 8 }}
              />
            )}
            <Button title="Deal a local game" onPress={startLocal} style={{ marginTop: 12 }} />
            {saved && (
              <Button
                title={`Resume local game · turn ${saved.turnNo}`}
                kind="tertiary"
                onPress={() => onResumeLocal(saved)}
                style={{ marginTop: 8 }}
              />
            )}
          </Card>

          <Card>
            <SectionTitle>Telegraph table (online)</SectionTitle>
            {!onlineEnabled ? (
              <T v="small" color={th.inkSoft}>
                Online play is off. Add your Supabase URL and anon key to src/net/online.js to host rooms.
              </T>
            ) : (
              <>
                <Button title="Host a room" onPress={() => online(() => createRoom(profile))} disabled={busy} />
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
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
                    kind="tertiary"
                    disabled={busy || code.trim().length !== 4}
                    onPress={() => online(() => joinRoom(code, profile))}
                  />
                </View>
                {busy && <ActivityIndicator color={th.ink} style={{ marginTop: 8 }} />}
                {err && <T v="small" color={th.districts.main.accent} style={{ marginTop: 8 }}>{err}</T>}
              </>
            )}
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

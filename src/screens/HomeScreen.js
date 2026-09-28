import { useEffect, useState } from 'react';
import {
  ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, Switch, TextInput, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bot, Plus, User, X } from 'lucide-react-native';
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
import { createRoom, joinRoom, onlineEnabled } from '../net/online';
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
    <SafeAreaView style={{ flex: 1, backgroundColor: th.ground }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 24, gap: 16 }} keyboardShouldPersistTaps="handled">
          <View style={{ alignItems: 'center', paddingTop: 16, gap: 8 }}>
            <View style={{ borderRadius: 52, shadowColor: th.gold.leaf, shadowOpacity: 0.25, shadowRadius: 12, shadowOffset: { width: 0, height: 8 } }}>
              <Seal kind="coin" size={104} />
            </View>
            <Wordmark size={34} align="center" />
            <T v="accent" color={th.inkSoft} style={{ fontSize: 16 }}>A frontier rail town, 1881</T>
          </View>
          <Rule kind="ornament" />

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
            <Rule style={{ marginTop: 12 }} />
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8, minHeight: 44 }}>
              <View style={{ flex: 1 }}>
                <T v="strong">Turn dispatches</T>
                <T v="small" color={th.inkSoft}>A telegram after each tycoon's turn saying what they did.</T>
              </View>
              <Switch
                value={profile.dispatches !== false}
                onValueChange={(on) => onProfile({ ...profile, dispatches: on })}
                trackColor={{ true: th.accent, false: th.rule }}
                thumbColor={th.ink}
                activeThumbColor={th.ink}
                accessibilityLabel="Turn dispatches"
              />
            </View>
          </Plate>

          <Plate>
            <SectionTitle aside={`${seats.length + 1} tycoons`}>Local table</SectionTitle>
            <T v="small" color={th.inkSoft} style={{ marginBottom: 4 }}>
              Pass-and-play on this phone. 2–6 tycoons.
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

          <Plate>
            <SectionTitle>Telegraph table (online)</SectionTitle>
            {!onlineEnabled ? (
              <T v="small" color={th.inkSoft}>
                Online play is off. Add your Supabase URL and anon key to src/net/online.js to host rooms.
              </T>
            ) : (
              <>
                <Button title="Host a room" kind="iron" onPress={() => online(() => createRoom(profile))} disabled={busy} />
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
                    kind="ghost"
                    disabled={busy || code.trim().length !== 4}
                    onPress={() => online(() => joinRoom(code, profile))}
                  />
                </View>
                {busy && <ActivityIndicator color={th.ink} style={{ marginTop: 8 }} />}
                {err && <T v="small" color={th.jewel.carnelianText} style={{ marginTop: 8 }}>{err}</T>}
              </>
            )}
          </Plate>
        </ScrollView>
        <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12, borderTopWidth: 1, borderColor: th.rule }}>
          <Button title="Deal a local game" onPress={startLocal} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

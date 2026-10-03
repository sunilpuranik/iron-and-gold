import { useEffect, useRef, useState } from 'react';
import {
  Platform, ScrollView, Share, TextInput, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ChevronLeft, Plus, Share2, Trash2, X,
} from 'lucide-react-native';
import { useTheme } from '../theme/theme';
import {
  Button, Plate, Rule, T, confirmAction,
} from '../theme/ui';
import { AVATARS, FONTS, MIN_TARGET } from '../theme/tokens';
import Portrait from '../components/Portrait';
import { BOT_NAMES } from '../game/data';
import {
  addBot as addBotTo, deleteRoom, fetchRoom, gameOp, removePlayer, renameRoom, subscribeRoom,
} from '../net/online';

// Where the web version lives (EXPO_PUBLIC_WEB_URL). With it, the share message carries a link
// that opens the join screen with the code filled in, so friends need nothing installed.
const WEB_URL = (process.env.EXPO_PUBLIC_WEB_URL || '').replace(/\/$/, '');

async function shareRoom(code, title) {
  const link = WEB_URL ? `${WEB_URL}/?room=${code}` : null;
  const table = title ? `my Iron & Gold table "${title}"` : 'my Iron & Gold table';
  const message = link
    ? `Join ${table}: ${link}\n(room code ${code})`
    : `Join ${table} — room code ${code}`;
  try {
    await Share.share({ message });
  } catch {
    // Browsers without the share sheet: copy the invite instead.
    if (Platform.OS === 'web' && navigator.clipboard) await navigator.clipboard.writeText(message).catch(() => {});
  }
}

export default function LobbyScreen({ initialRow, profile, onStarted, onLeave }) {
  const th = useTheme();
  const [row, setRow] = useState(initialRow);
  const [err, setErr] = useState(null);
  const rowRef = useRef(initialRow);
  const code = initialRow.code;
  const isHost = row.lobby.host === profile.id;
  const [title, setTitle] = useState(initialRow.title || '');
  const titleChanged = title.trim() !== (row.title || '');
  const players = row.lobby.players;

  useEffect(() => {
    const accept = (r) => {
      if (r && r.seq > rowRef.current.seq) {
        rowRef.current = r;
        setRow(r);
      }
    };
    const unsub = subscribeRoom(code, accept);
    // A null row means the host closed the table.
    const poll = setInterval(() => fetchRoom(code)
      .then((r) => (r ? accept(r) : onLeave('The host closed that table.')))
      .catch(() => {}), 5000);
    return () => {
      unsub();
      clearInterval(poll);
    };
  }, [code]);

  useEffect(() => {
    if (row.state) onStarted(row);
  }, [row]);

  const act = async (fn) => {
    setErr(null);
    try {
      const r = await fn();
      if (r && r.seq > rowRef.current.seq) {
        rowRef.current = r;
        setRow(r);
      }
    } catch (e) {
      setErr(e.message);
    }
  };

  const addBot = () => act(() => {
    const name = BOT_NAMES.find((n) => !players.some((p) => p.name === n)) || 'Bot';
    return addBotTo(code, name, players.length % AVATARS.length);
  });

  const remove = (id) => act(() => removePlayer(code, id));

  const saveTitle = () => act(() => renameRoom(code, title));

  const close = () => confirmAction({
    title: 'Close this table?',
    message: 'The room is deleted for everyone. This cannot be undone.',
    ok: 'Close table',
    onOk: async () => {
      setErr(null);
      try {
        await deleteRoom(code);
        onLeave();
      } catch (e) {
        setErr(e.message);
      }
    },
  });

  const start = () => act(() => gameOp(code, 'start', rowRef.current.seq));

  // Guests give up their seat; the host's table stays open under "Your tables" on Home.
  const leave = async () => {
    if (!isHost) await remove(profile.id);
    onLeave();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: th.ground }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', minHeight: 48 }}>
        <Button iconOnly icon={ChevronLeft} label="Leave room" onPress={leave} />
        <T v="title" style={{ flex: 1 }} numberOfLines={1}>{row.title || 'Telegraph table'}</T>
      </View>
      <Rule kind="gilt" />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
        {isHost && (
          <Plate>
            <T v="title" style={{ marginBottom: 8, fontSize: 16 }}>Room name</T>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="Name this table (optional)"
                placeholderTextColor={th.inkSoft}
                maxLength={32}
                accessibilityLabel="Room name"
                returnKeyType="done"
                onSubmitEditing={() => titleChanged && saveTitle()}
                style={{
                  flex: 1, minHeight: MIN_TARGET, borderWidth: 1, borderColor: th.field, paddingHorizontal: 12,
                  color: th.ink, fontFamily: FONTS.ui, fontSize: 16, backgroundColor: th.ground,
                }}
              />
              <Button title="Save" kind="ghost" disabled={!titleChanged} onPress={saveTitle} />
            </View>
          </Plate>
        )}

        <Plate style={{ alignItems: 'center' }}>
          <T v="accent" color={th.inkSoft}>Room code</T>
          <T v="display" style={{ fontSize: 48, letterSpacing: 8 }}>{code}</T>
          <Button
            title="Share code"
            kind="ghost"
            icon={Share2}
            onPress={() => shareRoom(code, row.title)}
            style={{ alignSelf: 'stretch', marginTop: 8 }}
          />
        </Plate>

        <Plate>
          <T v="title" style={{ marginBottom: 6 }}>Tycoons ({players.length}/6)</T>
          {players.map((p) => (
            <View key={p.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 44 }}>
              <Portrait index={p.avatar} bot={p.bot} size={30} />
              <T v="strong" style={{ flex: 1 }}>
                {p.name}
                {p.id === row.lobby.host ? '  · host' : ''}
                {p.id === profile.id ? '  · you' : ''}
              </T>
              {isHost && p.id !== profile.id && <Button iconOnly icon={X} label={`Remove ${p.name}`} onPress={() => remove(p.id)} />}
            </View>
          ))}
          {isHost && players.length < 6 && (
            <Button title="Add a bot" kind="ghost" icon={Plus} onPress={addBot} style={{ marginTop: 8 }} />
          )}
        </Plate>

        {err && <T v="small" color={th.jewel.carnelianText}>{err}</T>}

        {isHost ? (
          <Button title={players.length < 2 ? 'Need 2 tycoons to start' : 'Ring the opening bell'} disabled={players.length < 2} onPress={start} />
        ) : (
          <T v="accent" color={th.inkSoft} style={{ textAlign: 'center' }}>Waiting for the host to start…</T>
        )}
        {isHost && (
          <Button title="Close this table" kind="ghost" icon={Trash2} color={th.jewel.carnelianText} onPress={close} />
        )}
        <T v="small" color={th.inkSoft} style={{ textAlign: 'center' }}>
          Bots move whenever anyone at the table has the game open. You can close the app and pick this table up later from Home.
        </T>
      </ScrollView>
    </SafeAreaView>
  );
}

import { useEffect, useRef, useState } from 'react';
import { ScrollView, Share, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Plus, Share2, X } from 'lucide-react-native';
import { useTheme } from '../theme/theme';
import {
  Button, Plate, Rule, T,
} from '../theme/ui';
import { AVATARS } from '../theme/tokens';
import Portrait from '../components/Portrait';
import { BOT_NAMES } from '../game/data';
import { newGame } from '../game/engine';
import { fetchRoom, mutateRoom, subscribeRoom } from '../net/online';

export default function LobbyScreen({ initialRow, profile, onStarted, onLeave }) {
  const th = useTheme();
  const [row, setRow] = useState(initialRow);
  const [err, setErr] = useState(null);
  const rowRef = useRef(initialRow);
  const code = initialRow.code;
  const isHost = row.lobby.host === profile.id;
  const players = row.lobby.players;

  useEffect(() => {
    const accept = (r) => {
      if (r && r.seq > rowRef.current.seq) {
        rowRef.current = r;
        setRow(r);
      }
    };
    const unsub = subscribeRoom(code, accept);
    const poll = setInterval(() => fetchRoom(code).then(accept).catch(() => {}), 5000);
    return () => {
      unsub();
      clearInterval(poll);
    };
  }, [code]);

  useEffect(() => {
    if (row.state) onStarted(row);
  }, [row]);

  const mutate = async (fn) => {
    setErr(null);
    try {
      const r = await mutateRoom(code, fn);
      if (r.seq > rowRef.current.seq) {
        rowRef.current = r;
        setRow(r);
      }
    } catch (e) {
      setErr(e.message);
    }
  };

  const addBot = () => mutate((r) => {
    const ps = r.lobby.players;
    if (ps.length >= 6 || r.state) return null;
    const name = BOT_NAMES.find((n) => !ps.some((p) => p.name === n)) || 'Bot';
    const bot = { id: 'bot-' + Math.random().toString(36).slice(2, 8), name, avatar: ps.length % AVATARS.length, bot: true };
    return { lobby: { ...r.lobby, players: [...ps, bot] } };
  });

  const remove = (id) => mutate((r) => (r.state ? null : {
    lobby: { ...r.lobby, players: r.lobby.players.filter((p) => p.id !== id) },
  }));

  const start = () => mutate((r) => {
    if (r.state || r.lobby.players.length < 2) return null;
    return { state: newGame(r.lobby.players) };
  });

  const leave = async () => {
    if (!isHost) await remove(profile.id);
    onLeave();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: th.paper }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', minHeight: 48 }}>
        <Button iconOnly icon={ChevronLeft} label="Leave room" onPress={leave} />
        <T v="title" style={{ flex: 1 }}>Telegraph table</T>
      </View>
      <Rule kind="gilt" />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
        <Plate style={{ alignItems: 'center' }}>
          <T v="accent" color={th.inkSoft}>Room code</T>
          <T v="display" style={{ fontSize: 48, letterSpacing: 8 }}>{code}</T>
          <Button
            title="Share code"
            kind="ghost"
            icon={Share2}
            onPress={() => Share.share({ message: `Join my Iron & Gold table — room code ${code}` })}
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

        {err && <T v="small" color={th.districts.main.accent}>{err}</T>}

        {isHost ? (
          <Button title={players.length < 2 ? 'Need 2 tycoons to start' : 'Ring the opening bell'} disabled={players.length < 2} onPress={start} />
        ) : (
          <T v="accent" color={th.inkSoft} style={{ textAlign: 'center' }}>Waiting for the host to start…</T>
        )}
        <T v="small" color={th.inkSoft} style={{ textAlign: 'center' }}>
          The host's phone runs the bots — keep it open during the game.
        </T>
      </ScrollView>
    </SafeAreaView>
  );
}

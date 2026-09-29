import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import { IMFellEnglish_400Regular_Italic } from '@expo-google-fonts/im-fell-english/400Regular_Italic';
import { LibreFranklin_400Regular } from '@expo-google-fonts/libre-franklin/400Regular';
import { LibreFranklin_500Medium } from '@expo-google-fonts/libre-franklin/500Medium';
import { LibreFranklin_600SemiBold } from '@expo-google-fonts/libre-franklin/600SemiBold';
import { Cinzel_600SemiBold } from '@expo-google-fonts/cinzel/600SemiBold';
import { Cinzel_700Bold } from '@expo-google-fonts/cinzel/700Bold';
import { ThemeProvider, useTheme } from './src/theme/theme';
import { loadProfile, saveProfile } from './src/store/storage';
import { useLocalGame } from './src/game/useLocalGame';
import { useOnlineGame } from './src/net/useOnlineGame';
import HomeScreen from './src/screens/HomeScreen';
import LobbyScreen from './src/screens/LobbyScreen';
import GameScreen from './src/screens/GameScreen';

function LocalGame({ initial, onExit, ...rest }) {
  const ctl = useLocalGame(initial);
  return <GameScreen ctl={ctl} onExit={onExit} {...rest} />;
}

function OnlineGame({
  row, profile, onExit, ...rest
}) {
  const ctl = useOnlineGame(row.code, profile, row);
  return <GameScreen ctl={ctl} onExit={onExit} {...rest} />;
}

function Root() {
  const th = useTheme();
  const [profile, setProfile] = useState(null);
  const [screen, setScreen] = useState({ name: 'home' });

  useEffect(() => {
    loadProfile().then(setProfile);
  }, []);

  const updateProfile = useCallback((p) => {
    setProfile(p);
    saveProfile(p);
  }, []);

  const home = useCallback(() => setScreen({ name: 'home' }), []);
  const dispatchProps = profile ? {
    dispatches: profile.dispatches !== false,
    onDispatches: (on) => updateProfile({ ...profile, dispatches: on }),
  } : {};

  let body;
  if (!profile) {
    body = <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator color={th.ink} /></View>;
  } else if (screen.name === 'local') {
    body = <LocalGame key={screen.key} initial={screen.state} onExit={home} {...dispatchProps} />;
  } else if (screen.name === 'lobby') {
    body = (
      <LobbyScreen
        initialRow={screen.row}
        profile={{ ...profile, id: screen.uid }}
        onLeave={home}
        onStarted={(row) => setScreen({ name: 'online', row, uid: screen.uid })}
      />
    );
  } else if (screen.name === 'online') {
    // Online, you are your Supabase user id; the local profile id is for pass-and-play only.
    body = <OnlineGame row={screen.row} profile={{ ...profile, id: screen.uid }} onExit={home} {...dispatchProps} />;
  } else {
    body = (
      <HomeScreen
        profile={profile}
        onProfile={updateProfile}
        onStartLocal={(state) => setScreen({ name: 'local', state, key: Date.now() })}
        onResumeLocal={(state) => setScreen({ name: 'local', state, key: Date.now() })}
        onLobby={(row, uid) => setScreen({ name: row.state ? 'online' : 'lobby', row, uid })}
      />
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: th.ground }}>
      <StatusBar style={th.dark ? 'light' : 'dark'} />
      {body}
    </View>
  );
}

export default function App() {
  const [loaded] = useFonts({
    IMFellEnglish_400Regular_Italic,
    LibreFranklin_400Regular,
    LibreFranklin_500Medium,
    LibreFranklin_600SemiBold,
    Cinzel_600SemiBold,
    Cinzel_700Bold,
  });
  if (!loaded) return null;
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <Root />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

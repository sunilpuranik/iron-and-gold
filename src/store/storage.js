// AsyncStorage persistence for the profile and the local pass-and-play game.
import AsyncStorage from '@react-native-async-storage/async-storage';

const PROFILE = 'ig.profile.v1';
const LOCAL_GAME = 'ig.localGame.v1';

function randomId() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

async function read(key) {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

async function write(key, value) {
  try {
    if (value == null) await AsyncStorage.removeItem(key);
    else await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or unavailable — the game keeps running in memory.
  }
}

// A first-time player gets a frontier alias and a magnate at random, so they can play on the first
// tap and still look like somebody at a friend's table. Both are editable on the wanted poster.
export const STARTER_ALIASES = [
  'Dusty Rhodes', 'Calamity Kate', 'Silver Jack', 'Rattlesnake Ruth', 'Copper Sam', 'Deadeye Dora',
  'Lucky Lou', 'Iron Ike', 'Big Nose Nell', 'Tumbleweed Tom', 'Sundown Sal', 'Whiskey Will',
];
const pick = (list) => list[Math.floor(Math.random() * list.length)];

export async function loadProfile() {
  const p = await read(PROFILE);
  if (p && p.id) return p;
  const fresh = {
    id: randomId(), name: pick(STARTER_ALIASES), avatar: Math.floor(Math.random() * 6), seats: null, firstRun: true,
  };
  await write(PROFILE, fresh);
  return fresh;
}

export const saveProfile = (p) => write(PROFILE, p);
export const loadLocalGame = () => read(LOCAL_GAME);
export const saveLocalGame = (s) => write(LOCAL_GAME, s);
export const clearLocalGame = () => write(LOCAL_GAME, null);

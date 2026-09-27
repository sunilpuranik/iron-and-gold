// Haptics and sound. Every call is fire-and-forget and never throws.
import * as Haptics from 'expo-haptics';

const safe = (fn) => {
  try {
    const r = fn();
    if (r && r.catch) r.catch(() => {});
  } catch {
    // Haptics unavailable (web / simulator) — ignore.
  }
};

export const feel = {
  select: () => safe(() => Haptics.selectionAsync()),
  build: () => safe(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)),
  buy: () => safe(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)),
  buyout: () => {
    safe(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy));
    setTimeout(() => safe(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)), 140);
  },
  bell: () => safe(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)),
};

// Buyout sting. Stubbed until a sound file is added:
//   1. drop the file at assets/sounds/sting.mp3
//   2. replace the body below with:
//        import { createAudioPlayer } from 'expo-audio';
//        const player = createAudioPlayer(require('../../assets/sounds/sting.mp3'));
//        player.seekTo(0); player.play();
export function playSting() {}

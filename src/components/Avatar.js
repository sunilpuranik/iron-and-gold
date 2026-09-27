import { View } from 'react-native';
import { Bot } from 'lucide-react-native';
import { useTheme } from '../theme/theme';
import { AVATARS } from '../theme/tokens';
import Portrait from './Portrait';

// A tycoon portrait in an ink frame. Bots wear a small clockwork badge.
export default function Avatar({ index = 0, size = 32, bot, ring }) {
  const th = useTheme();
  const badge = Math.max(12, Math.round(size * 0.38));
  return (
    <View
      style={{
        width: size, height: size, borderWidth: ring ? 2 : 1, borderColor: ring ? th.gilt : th.ink,
        backgroundColor: AVATARS[index % AVATARS.length], overflow: 'hidden',
      }}
    >
      <Portrait index={index} size={size - (ring ? 4 : 2)} />
      {bot && (
        <View
          style={{
            position: 'absolute', right: 0, bottom: 0, width: badge, height: badge,
            backgroundColor: th.ink, alignItems: 'center', justifyContent: 'center',
          }}
        >
          <Bot size={badge * 0.75} color={th.onInk} strokeWidth={1.5} />
        </View>
      )}
    </View>
  );
}

import { View } from 'react-native';
import { Bot, HardHat } from 'lucide-react-native';
import { useTheme } from '../theme/theme';
import { AVATARS } from '../theme/tokens';

export default function Avatar({ index = 0, size = 32, bot, ring }) {
  const th = useTheme();
  const Icon = bot ? Bot : HardHat;
  return (
    <View
      style={{
        width: size, height: size, backgroundColor: AVATARS[index % AVATARS.length],
        borderWidth: ring ? 2 : 1, borderColor: ring ? th.gilt : th.ink,
        alignItems: 'center', justifyContent: 'center',
      }}
    >
      <Icon size={size * 0.62} color="#F2EBDD" strokeWidth={1.5} />
    </View>
  );
}

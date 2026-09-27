// The Iron & Gold emblem: an "I&G 1881" gold coin on an iron field — the app icon, in-game.
import { View } from 'react-native';
import Svg, {
  Circle, Defs, G, LinearGradient, RadialGradient, Rect, Stop,
} from 'react-native-svg';
import { T } from '../theme/text';
import { FONTS } from '../theme/tokens';

const GOLD = { hi: '#F7E4A0', mid: '#CFA64A', lo: '#7E5A1C' };
const LETTER = '#E6C46E';

export default function Emblem({ size = 64 }) {
  const shadow = { textShadowColor: '#3A2A0E', textShadowOffset: { width: 0, height: size / 90 }, textShadowRadius: 0 };
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Defs>
          <LinearGradient id="em-gold" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={GOLD.hi} />
            <Stop offset="0.45" stopColor={GOLD.mid} />
            <Stop offset="1" stopColor={GOLD.lo} />
          </LinearGradient>
          <RadialGradient id="em-field" cx="0.5" cy="0.4" r="0.7">
            <Stop offset="0" stopColor="#4A4D53" />
            <Stop offset="1" stopColor="#1F2023" />
          </RadialGradient>
        </Defs>
        <Circle cx="50" cy="50" r="48" fill="url(#em-gold)" stroke="#6E4F16" strokeWidth="1" />
        <Circle cx="50" cy="50" r="44.3" fill="none" stroke="#FFF3C4" strokeWidth="1.6" strokeDasharray="0.01 3.9" strokeLinecap="round" />
        <Circle cx="50" cy="50" r="40.5" fill="url(#em-field)" stroke="#6E4F16" strokeWidth="0.8" />
        <Circle cx="50" cy="50" r="37.8" fill="none" stroke={GOLD.mid} strokeWidth="0.5" opacity="0.8" />
        <G>
          <Rect x="29" y="71" width="42" height="1.2" fill={GOLD.mid} />
          <Rect x="29" y="73.8" width="42" height="1.2" fill={GOLD.mid} />
          {[30, 34, 38, 42, 46, 50, 54, 58, 62, 66].map((x) => (
            <Rect key={x} x={x} y="69.8" width="1.6" height="6.4" fill="#9C7A35" />
          ))}
        </G>
      </Svg>
      <View style={{ position: 'absolute', left: 0, right: 0, top: size * 0.25, alignItems: 'center' }}>
        <T style={{ fontFamily: FONTS.money, fontSize: size * 0.075, letterSpacing: size * 0.02, color: LETTER }}>1881</T>
      </View>
      <View style={{ position: 'absolute', left: 0, right: 0, top: size * 0.33, alignItems: 'center' }}>
        <T style={[{ fontFamily: FONTS.display, fontSize: size * 0.3, lineHeight: size * 0.36, color: LETTER }, shadow]}>
          I
          <T style={[{ fontFamily: FONTS.accent, fontSize: size * 0.23, color: LETTER }, shadow]}>&amp;</T>
          G
        </T>
      </View>
    </View>
  );
}

// Tycoon portraits drawn as banknote cameos: a sepia profile bust on an engraved,
// line-hatched ground inside a beaded gold oval. Colours are fixed so a tycoon looks
// the same in light and dark mode. One cameo at every size, from roster rows to the handoff.
import { View } from 'react-native';
import { Bot } from 'lucide-react-native';
import Svg, {
  Circle, ClipPath, Defs, Ellipse, G, LinearGradient, Path, Pattern, Rect, Stop,
} from 'react-native-svg';
import { useTheme } from '../theme/theme';
import { AVATARS, GOLD as GILT } from '../theme/tokens';

const SEPIA = '#2A1F14';
const CREAM = '#F3E7CC';
const HATCH = '#B89A5E';
const GOLD = { hi: '#F4DE93', mid: '#CFA64A', lo: '#8A6421' };
const PLUM = '#7A2A22';

// Head, neck and shoulders in profile, facing right.
const GENT = 'M40 71 C37 64 35 58 35 51 C33 40 37 28 49 25 C59 22 67 28 68 36 L68 40 C69 42 71 44 72 47 L75 53 '
  + 'C75 55 73 55.5 71 55.5 C71 57 72 58 71.5 59.5 C72 60.5 71.5 62 70.5 62.5 C71 64.5 70 66.5 67.5 67.5 '
  + 'C64.5 69 61 68.8 59 68.5 L59 74 C72 78 86 85 90 104 L10 104 C12 88 24 78 40 74 Z';
const LADY = 'M41 72 C38 64 36 58 36 51 C34 40 38 29 50 26 C59 24 66 29 67 37 L67 41 C68 43 70 45 71 48 L73 52.5 '
  + 'C73 54.5 71.5 55 70 55 C70.5 56.5 71.5 57.5 70.8 59 C71.5 60.5 70.8 62 69.8 62.3 C70.2 64.5 69 66 67 67 '
  + 'C64.5 68.4 61.5 68.4 60 68 L60.5 76 C72 79 84 86 88 104 L12 104 C14 90 26 80 41 76 Z';

// Fine cream engraving over the silhouette: eye, brow and ear.
function Features({ lady }) {
  const dx = lady ? -1 : 0;
  return (
    <G stroke={CREAM} fill="none" strokeLinecap="round">
      <Path d={`M${62.5 + dx} 44.6 Q${64.5 + dx} 43.3 ${66.5 + dx} 44.7`} strokeWidth="0.9" />
      <Path d={`M${61.5 + dx} 41.4 Q${64.5 + dx} 39.9 ${67 + dx} 41.2`} strokeWidth="0.7" opacity="0.8" />
      <Path d="M47 45 C44 45 43.5 51 46.5 52" strokeWidth="0.8" opacity="0.85" />
    </G>
  );
}

function Lapel() {
  return (
    <G>
      <Path d="M59 74 L63.5 85 L57 104" stroke={CREAM} strokeWidth="0.9" fill="none" opacity="0.8" />
      <Path d="M59 72 L66 77.5 L60 79.5 Z" fill={CREAM} />
    </G>
  );
}

const TOP_HAT = (band) => (
  <G>
    <Path d="M38 27 L39.5 6 L64 6 L65.5 27 Z" fill={SEPIA} />
    <Path d="M38.6 21.5 L64.9 21.5 L65.2 25.5 L38.3 25.5 Z" fill={band} />
    <Path d="M29 28 C40 24.5 64 24.5 75 27.5 C73 30.5 66 30 50 30 C40 30 32 31 29 28 Z" fill={SEPIA} />
    <Path d="M41 8 L40 24" stroke={CREAM} strokeWidth="0.6" opacity="0.5" />
  </G>
);

const TYCOONS = [
  // 0 The Baron: top hat, waxed handlebar moustache, gold monocle, bow tie
  () => (
    <G>
      <Path d={GENT} fill={SEPIA} />
      <Lapel />
      <Features />
      <Path d="M66 56.5 C69 55 72 55.5 74 56.5 C76 57.3 78 56 79 53.5 C79.5 57 77 59.5 73.5 59 C71 58.8 68.5 58.3 66 58.5 Z" fill={SEPIA} />
      <Circle cx="65" cy="45" r="3.2" fill="none" stroke={GOLD.mid} strokeWidth="1.1" />
      <Path d="M65 48.2 C64 58 60 66 62 76" stroke={GOLD.mid} strokeWidth="0.6" fill="none" />
      <Path d="M58.5 73.5 L62.5 71.5 L62.5 76 Z M62.5 73.7 L66.5 71.8 L66.5 76 Z" fill={CREAM} />
      {TOP_HAT(PLUM)}
    </G>
  ),
  // 1 The Banker: bowler, spectacles, silk cravat with a gold pin
  () => (
    <G>
      <Path d={GENT} fill={SEPIA} />
      <Lapel />
      <Features />
      <Circle cx="65" cy="45" r="2.7" fill="none" stroke={CREAM} strokeWidth="0.8" />
      <Path d="M62.3 45 L47.5 46.2" stroke={CREAM} strokeWidth="0.6" />
      <Path d="M52 47 C51 52 52 57 55 61" stroke={CREAM} strokeWidth="0.5" fill="none" opacity="0.6" />
      <Path d="M59 72 C63 74 64.5 78 61.5 85 C59.5 80.5 58.5 76 59 72 Z" fill={CREAM} />
      <Circle cx="61.4" cy="78" r="1.1" fill={GOLD.mid} />
      <Path d="M37 28 C37 13 64 12 66 27 Z" fill={SEPIA} />
      <Path d="M31 28.5 C42 26 62 26 73 27 C72 29.5 42 30.5 31 28.5 Z" fill={SEPIA} />
      <Path d="M40 20 C42 15 50 13.5 56 14.5" stroke={CREAM} strokeWidth="0.6" fill="none" opacity="0.5" />
    </G>
  ),
  // 2 The Cattle Queen: wide-brim hat with ostrich plume, chignon, pearls
  () => (
    <G>
      <Path d="M36 48 C28 50 26 60 34 65 C38 63 38 55 37 50 Z" fill={SEPIA} />
      <Path d={LADY} fill={SEPIA} />
      <Features lady />
      <Path d="M60.5 76 L64 86" stroke={CREAM} strokeWidth="0.8" opacity="0.7" />
      <Circle cx="47" cy="56.5" r="1.4" fill={GOLD.mid} />
      {[[46, 73.8], [50, 74.8], [54, 75.5], [58, 76]].map(([x, y]) => (
        <Circle key={x} cx={x} cy={y} r="1.1" fill={CREAM} />
      ))}
      <Path d="M40 26 C40 15 60 13 63 24 Z" fill={SEPIA} />
      <Path d="M24 28 C36 21 66 20 82 23 C78 27 60 28 46 29 C36 30 28 31 24 28 Z" fill={SEPIA} />
      <Path d="M44 22 C38 10 30 6 20 4 C27 12 34 18 42 24 Z" fill={CREAM} stroke={SEPIA} strokeWidth="0.5" />
      <Path d="M42 23 C36 14 29 9 22 6" stroke={SEPIA} strokeWidth="0.4" fill="none" />
    </G>
  ),
  // 3 The Rail King: top hat, full beard, cigar
  () => (
    <G>
      <Path d={GENT} fill={SEPIA} />
      <Lapel />
      <Features />
      <Path d="M59 60 C62 58.5 68 59 71 60.5 C72 66 70 72 65 76 C61 78 56 76 54 72 C53 68 55 63 59 60 Z" fill={SEPIA} />
      <Path d="M60 63 C60 68 62 72 64 74 M64 62 C64 67 66 70 67 72" stroke={CREAM} strokeWidth="0.5" fill="none" opacity="0.55" />
      <Path d="M70 60.5 L82 58.5 L82.6 61.2 L70.6 63 Z" fill="#7A5230" />
      <Circle cx="82.5" cy="59.9" r="1.3" fill="#C9744A" />
      <Path d="M84 57.5 C86.5 54 83 51 86 47" stroke={CREAM} strokeWidth="0.7" fill="none" opacity="0.8" />
      {TOP_HAT(GOLD.mid)}
    </G>
  ),
  // 4 The Oilman: Stetson, horseshoe moustache, bolo tie
  () => (
    <G>
      <Path d={GENT} fill={SEPIA} />
      <Features />
      <Path d="M66 56 C70 55 73 56 73.5 57.5 L73 64.5 L71.5 64.5 L70.5 59 C69 58.6 67.5 58.8 66 59 Z" fill={SEPIA} />
      <Path d="M59 73 L61 87 M62 73 L61 87" stroke={CREAM} strokeWidth="0.7" />
      <Circle cx="61" cy="80" r="1.9" fill={GOLD.mid} stroke={SEPIA} strokeWidth="0.4" />
      <Path d="M39 27 C38 14 45 11 51 15 C57 11 64 13 64 27 Z" fill={SEPIA} />
      <Path d="M39 24.5 L64 24.5" stroke={CREAM} strokeWidth="0.8" opacity="0.8" />
      <Path d="M20 29 C30 24 66 23 84 27 C80 31 70 30.5 52 31 C36 31.5 26 33 20 29 Z" fill={SEPIA} />
    </G>
  ),
  // 5 The Heiress: upswept hair, small plumed hat, pearl choker, drop earring
  () => (
    <G>
      <Circle cx="37" cy="56" r="4.2" fill={SEPIA} />
      <Circle cx="39.5" cy="62.5" r="3.6" fill={SEPIA} />
      <Path d={LADY} fill={SEPIA} />
      <Path d="M36 38 C34 26 44 20 54 22 C60 23 64 26 66 32 C58 28 46 28 40 34 Z" fill={SEPIA} />
      <Features lady />
      <Path d="M42 34 C46 30 54 29 60 31 M40 40 C44 35 52 33 58 34" stroke={CREAM} strokeWidth="0.5" fill="none" opacity="0.5" />
      {[[51.5, 71.2], [54.5, 71.4], [57.5, 71.2], [60.3, 70.7]].map(([x, y]) => (
        <Circle key={x} cx={x} cy={y} r="1.15" fill={CREAM} />
      ))}
      <Path d="M47 55.5 L47 58.5" stroke={GOLD.mid} strokeWidth="0.7" />
      <Circle cx="47" cy="59.5" r="1.2" fill={GOLD.mid} />
      <Path d="M46 24 C48 18 60 17 63 22 L64 24 C58 25 52 25 46 24 Z" fill={SEPIA} />
      <Path d="M50 20 C44 10 36 7 30 8 C36 12 42 16 48 22 Z" fill={GOLD.mid} stroke={SEPIA} strokeWidth="0.4" />
    </G>
  ),
];

export const PORTRAIT_COUNT = TYCOONS.length;

function Cameo({ index, size }) {
  const Figure = TYCOONS[((index % TYCOONS.length) + TYCOONS.length) % TYCOONS.length];
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <LinearGradient id="pf-gold" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={GOLD.hi} />
          <Stop offset="0.5" stopColor={GOLD.mid} />
          <Stop offset="1" stopColor={GOLD.lo} />
        </LinearGradient>
        <Pattern id="pf-hatch" width="100" height="2.2" patternUnits="userSpaceOnUse">
          <Rect x="0" y="0" width="100" height="0.55" fill={HATCH} opacity="0.6" />
        </Pattern>
        <ClipPath id="pf-clip">
          <Ellipse cx="50" cy="51" rx="39.5" ry="42.5" />
        </ClipPath>
      </Defs>
      <Ellipse cx="50" cy="51" rx="46.5" ry="48.5" fill="url(#pf-gold)" stroke={GOLD.lo} strokeWidth="0.8" />
      <Ellipse cx="50" cy="51" rx="43" ry="45.5" fill="none" stroke={GOLD.hi} strokeWidth="1.6" strokeDasharray="0.01 3.1" strokeLinecap="round" />
      <Ellipse cx="50" cy="51" rx="39.5" ry="42.5" fill={CREAM} />
      <G clipPath="url(#pf-clip)">
        <Rect x="0" y="0" width="100" height="100" fill="url(#pf-hatch)" />
        <G transform="translate(-2 5)">
          <Figure />
        </G>
      </G>
      <Ellipse cx="50" cy="51" rx="39.5" ry="42.5" fill="none" stroke={GOLD.lo} strokeWidth="1" />
    </Svg>
  );
}

// A tycoon in a round gold-rimmed frame. `ring` marks the one acting or chosen; bots wear a clockwork badge.
export default function Portrait({
  index = 0, size = 40, bot, ring,
}) {
  const th = useTheme();
  const rim = size >= 32 ? 2 : 1;
  const badge = Math.max(12, Math.round(size * 0.36));
  return (
    <View
      style={{
        width: size, height: size, borderRadius: size / 2, borderWidth: rim,
        borderColor: ring ? GILT.shine : GILT.deep, backgroundColor: AVATARS[index % AVATARS.length],
        alignItems: 'center', justifyContent: 'center',
      }}
    >
      {ring && (
        <View
          style={{
            position: 'absolute', left: -rim - 2, top: -rim - 2, right: -rim - 2, bottom: -rim - 2,
            borderRadius: size, borderWidth: 2, borderColor: GILT.leaf,
            shadowColor: GILT.bright, shadowOpacity: 0.5, shadowRadius: 7, shadowOffset: { width: 0, height: 0 },
          }}
        />
      )}
      <Cameo index={index} size={size - rim * 2} />
      {bot && (
        <View
          style={{
            position: 'absolute', right: -1, bottom: -1, width: badge, height: badge, borderRadius: badge / 2,
            backgroundColor: th.iron.lo, borderWidth: 1, borderColor: GILT.deep, alignItems: 'center', justifyContent: 'center',
          }}
        >
          <Bot size={badge * 0.66} color={th.iron.text} strokeWidth={1.5} />
        </View>
      )}
    </View>
  );
}

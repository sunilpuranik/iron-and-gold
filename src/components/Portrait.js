// Engraved tycoon portraits — a bust in a frock coat plus a signature hat and whiskers.
// Drawn in a 100×100 box and framed tight on the face; colours are fixed so a tycoon looks the same in light and dark.
import Svg, {
  Circle, Ellipse, G, Line, Path, Polygon, Rect,
} from 'react-native-svg';

const INK = '#1E1B16';
const COAT = '#2A2620';
const FACE = '#F2E3C8';
const SHIRT = '#FBF7EE';
const GOLD = '#D4AF5A';
const LIP = '#8E3B32';

function Head({ children }) {
  return (
    <G>
      <Rect x="43" y="58" width="14" height="14" fill={FACE} />
      <Ellipse cx="35.5" cy="49" rx="3" ry="4.5" fill={FACE} stroke={INK} strokeWidth="1.2" />
      <Ellipse cx="64.5" cy="49" rx="3" ry="4.5" fill={FACE} stroke={INK} strokeWidth="1.2" />
      <Ellipse cx="50" cy="48" rx="14.5" ry="17.5" fill={FACE} stroke={INK} strokeWidth="1.5" />
      <Circle cx="44.5" cy="46" r="1.7" fill={INK} />
      <Circle cx="55.5" cy="46" r="1.7" fill={INK} />
      <Path d="M41 42.5 L47.5 41.5 M52.5 41.5 L59 42.5" stroke={INK} strokeWidth="1.3" strokeLinecap="round" />
      <Path d="M50 47 L48.5 53 L51 53.5" stroke={INK} strokeWidth="1" fill="none" strokeLinecap="round" />
      {children}
    </G>
  );
}

function Coat({ lady }) {
  if (lady) {
    return (
      <G>
        <Path d="M10 100 C 14 80, 32 72, 50 72 C 68 72, 86 80, 90 100 Z" fill={COAT} />
        <Path d="M36 74 C 42 84, 58 84, 64 74 C 58 78, 42 78, 36 74 Z" fill={FACE} />
      </G>
    );
  }
  return (
    <G>
      <Path d="M8 100 C 12 79, 30 71, 50 71 C 70 71, 88 79, 92 100 Z" fill={COAT} />
      <Polygon points="40,71 50,92 60,71" fill={SHIRT} />
      <Path d="M40 71 L50 92 L36 100 L30 76 Z M60 71 L50 92 L64 100 L70 76 Z" fill={INK} />
    </G>
  );
}

const TOP_HAT = (band) => (
  <G>
    <Rect x="36" y="8" width="28" height="24" fill={INK} />
    <Rect x="36" y="25" width="28" height="4" fill={band} />
    <Rect x="27" y="30" width="46" height="5" rx="2.5" fill={INK} />
  </G>
);

const BOW_TIE = (
  <Path d="M43 72 L50 75.5 L43 79 Z M57 72 L50 75.5 L57 79 Z" fill={INK} stroke={SHIRT} strokeWidth="0.6" />
);

const PORTRAITS = [
  // 0 The Baron: top hat, handlebar moustache, monocle
  () => (
    <G>
      <Coat />
      {BOW_TIE}
      <Head>
        <Path d="M36 56 C 40 51, 46 53, 50 55.5 C 54 53, 60 51, 64 56 C 61 54.5, 56 56.5, 50 58 C 44 56.5, 39 54.5, 36 56 Z" fill={INK} />
        <Circle cx="55.5" cy="46" r="4.3" fill="none" stroke={GOLD} strokeWidth="1.4" />
        <Path d="M59.5 48 C 64 58, 62 66, 66 74" stroke={GOLD} strokeWidth="0.8" fill="none" />
      </Head>
      {TOP_HAT('#8E3B32')}
    </G>
  ),
  // 1 The Banker: bowler, mutton chops, spectacles, cravat
  () => (
    <G>
      <Coat />
      <Path d="M45 71 L55 71 L53 82 L50 85 L47 82 Z" fill="#6B5A2E" />
      <Head>
        <Path d="M35.5 44 C 35 56, 38 62, 44 62 L44 57 C 40 56, 39 50, 39 44 Z M64.5 44 C 65 56, 62 62, 56 62 L56 57 C 60 56, 61 50, 61 44 Z" fill="#6E6456" />
        <Circle cx="44.5" cy="46" r="3.6" fill="none" stroke={INK} strokeWidth="1.1" />
        <Circle cx="55.5" cy="46" r="3.6" fill="none" stroke={INK} strokeWidth="1.1" />
        <Line x1="48.1" y1="46" x2="51.9" y2="46" stroke={INK} strokeWidth="1.1" />
        <Path d="M45 57.5 C 48 59, 52 59, 55 57.5" stroke={INK} strokeWidth="1.1" fill="none" />
      </Head>
      <Path d="M34 33 C 34 14, 66 14, 66 33 Z" fill={INK} />
      <Ellipse cx="50" cy="33" rx="21" ry="3.5" fill={INK} />
    </G>
  ),
  // 2 The Cattle Queen: wide-brim hat with feather, earrings, pearls
  () => (
    <G>
      <Path d="M33 40 C 28 58, 30 70, 38 72 L62 72 C 70 70, 72 58, 67 40 Z" fill="#5A3A22" />
      <Coat lady />
      <Head>
        <Path d="M45 57 C 48 58.5, 52 58.5, 55 57 C 52 60, 48 60, 45 57 Z" fill={LIP} />
        <Circle cx="35.5" cy="55.5" r="1.8" fill={GOLD} />
        <Circle cx="64.5" cy="55.5" r="1.8" fill={GOLD} />
      </Head>
      {[40, 45, 50, 55, 60].map((x, i) => <Circle key={x} cx={x} cy={i === 2 ? 69 : i % 4 === 0 ? 66 : 68} r="1.6" fill={SHIRT} stroke={INK} strokeWidth="0.4" />)}
      <Path d="M38 31 C 38 18, 62 18, 62 31 Z" fill={INK} />
      <Ellipse cx="50" cy="32" rx="30" ry="4.5" fill={INK} />
      <Path d="M60 26 C 70 12, 82 10, 88 6 C 84 16, 74 24, 62 28 Z" fill={SHIRT} stroke={INK} strokeWidth="0.8" />
    </G>
  ),
  // 3 The Rail King: top hat, full beard, cigar
  () => (
    <G>
      <Coat />
      <Head>
        <Path d="M35.5 48 C 34 66, 42 76, 50 76 C 58 76, 66 66, 64.5 48 C 62 56, 58 60, 50 60 C 42 60, 38 56, 35.5 48 Z" fill="#4A443A" />
        <Path d="M42 55 C 46 53, 54 53, 58 55 C 55 57, 45 57, 42 55 Z" fill="#4A443A" />
        <Rect x="55" y="58" width="15" height="3.2" fill="#8A6A22" transform="rotate(-12 55 58)" />
        <Circle cx="69.5" cy="55" r="1.8" fill="#C9744A" />
      </Head>
      {TOP_HAT(INK)}
      <Rect x="36" y="25" width="28" height="1.2" fill={GOLD} />
    </G>
  ),
  // 4 The Oilman: Stetson, horseshoe moustache, bolo tie
  () => (
    <G>
      <Coat />
      <Line x1="47" y1="72" x2="50" y2="86" stroke={INK} strokeWidth="1" />
      <Line x1="53" y1="72" x2="50" y2="86" stroke={INK} strokeWidth="1" />
      <Circle cx="50" cy="80" r="2.8" fill={GOLD} stroke={INK} strokeWidth="0.6" />
      <Head>
        <Path d="M41 55 C 44 52, 56 52, 59 55 L59 63 L56.5 63 L56 57 C 53 56, 47 56, 44 57 L43.5 63 L41 63 Z" fill="#5A2A1E" />
      </Head>
      <Path d="M35 31 C 35 14, 44 12, 50 17 C 56 12, 65 14, 65 31 Z" fill="#5A3A22" />
      <Rect x="35" y="27" width="30" height="3" fill={INK} />
      <Path d="M18 33 C 26 27, 74 27, 82 33 C 76 37, 24 37, 18 33 Z" fill="#5A3A22" stroke={INK} strokeWidth="0.8" />
    </G>
  ),
  // 5 The Heiress: curled hair, small plumed hat, pearl choker
  () => (
    <G>
      <Circle cx="36" cy="44" r="7" fill="#8A5A2E" />
      <Circle cx="64" cy="44" r="7" fill="#8A5A2E" />
      <Circle cx="35" cy="55" r="5.5" fill="#8A5A2E" />
      <Circle cx="65" cy="55" r="5.5" fill="#8A5A2E" />
      <Coat lady />
      <Head>
        <Path d="M37 40 C 40 29, 60 29, 63 40 C 58 34, 42 34, 37 40 Z" fill="#8A5A2E" />
        <Path d="M45 57 C 48 58.5, 52 58.5, 55 57 C 52 60, 48 60, 45 57 Z" fill={LIP} />
      </Head>
      {[44, 47, 50, 53, 56].map((x) => <Circle key={x} cx={x} cy="65.5" r="1.5" fill={SHIRT} stroke={INK} strokeWidth="0.4" />)}
      <Path d="M40 30 C 42 22, 58 22, 60 30 Z" fill={INK} transform="rotate(-10 50 28)" />
      <Ellipse cx="50" cy="30" rx="15" ry="2.6" fill={INK} transform="rotate(-10 50 30)" />
      <Path d="M56 24 C 60 12, 70 8, 74 4 C 72 14, 66 22, 58 26 Z" fill={GOLD} stroke={INK} strokeWidth="0.6" />
    </G>
  ),
];

export const PORTRAIT_COUNT = PORTRAITS.length;

export default function Portrait({ index = 0, size = 40, background }) {
  const Draw = PORTRAITS[((index % PORTRAITS.length) + PORTRAITS.length) % PORTRAITS.length];
  return (
    <Svg width={size} height={size} viewBox="12 4 76 76">
      {background ? <Rect x="0" y="0" width="100" height="100" fill={background} /> : null}
      <Draw />
    </Svg>
  );
}

// Engraved building silhouettes, drawn in a 100×100 box standing on y=100.
import Svg, { Circle, G, Path, Polygon, Rect } from 'react-native-svg';

const SHAPES = {
  // Telegraph pole + office
  cw: (c) => (
    <G fill={c}>
      <Rect x="20" y="12" width="5" height="88" />
      <Rect x="9" y="18" width="27" height="4" />
      <Rect x="12" y="29" width="21" height="4" />
      <Rect x="44" y="58" width="46" height="42" />
      <Polygon points="40,60 67,42 94,60" />
      <Rect x="52" y="44" width="30" height="8" />
    </G>
  ),
  // Landing warehouse + steamboat stack
  pp: (c) => (
    <G fill={c}>
      <Rect x="6" y="56" width="60" height="44" />
      <Polygon points="2,58 36,38 70,58" />
      <Rect x="76" y="26" width="10" height="74" />
      <Polygon points="72,20 90,20 86,28 76,28" />
    </G>
  ),
  // Depot + water tower
  pw: (c) => (
    <G fill={c}>
      <Rect x="6" y="64" width="54" height="36" />
      <Polygon points="0,66 33,48 66,66" />
      <Rect x="68" y="22" width="26" height="24" />
      <Polygon points="65,23 81,11 97,23" />
      <Path d="M70 46 L68 100 L72 100 L74 46 Z M88 46 L90 100 L94 100 L92 46 Z" />
      <Rect x="69" y="70" width="24" height="3" />
    </G>
  ),
  // Oil derrick + tank
  rm: (c) => (
    <G fill={c}>
      <Path d="M30 8 L36 8 L52 100 L46 100 L33 20 L20 100 L14 100 Z" />
      <Rect x="20" y="40" width="26" height="3" />
      <Rect x="17" y="62" width="32" height="3" />
      <Rect x="15" y="82" width="36" height="3" />
      <Rect x="58" y="64" width="38" height="36" />
      <Path d="M58 64 Q77 54 96 64 Z" />
    </G>
  ),
  // Arc-light tower + powerhouse
  ae: (c) => (
    <G fill={c}>
      <Path d="M27 14 L33 14 L40 100 L34 100 L30 30 L26 100 L20 100 Z" />
      <Circle cx="30" cy="9" r="7" />
      <Rect x="48" y="56" width="46" height="44" />
      <Polygon points="45,58 71,44 97,58" />
      <Rect x="83" y="34" width="7" height="18" />
    </G>
  ),
  // Steel mill with three stacks
  cr: (c) => (
    <G fill={c}>
      <Rect x="18" y="16" width="8" height="48" />
      <Rect x="42" y="24" width="8" height="40" />
      <Rect x="66" y="10" width="8" height="54" />
      <Path d="M4 100 L4 64 L20 52 L20 64 L40 52 L40 64 L60 52 L60 64 L80 52 L80 64 L96 64 L96 100 Z" />
    </G>
  ),
  // Bank: pediment + columns
  ft: (c) => (
    <G fill={c}>
      <Polygon points="8,40 50,16 92,40" />
      <Rect x="10" y="40" width="80" height="8" />
      <Rect x="16" y="50" width="8" height="38" />
      <Rect x="32" y="50" width="8" height="38" />
      <Rect x="60" y="50" width="8" height="38" />
      <Rect x="76" y="50" width="8" height="38" />
      <Rect x="44" y="60" width="12" height="28" />
      <Rect x="6" y="88" width="88" height="5" />
      <Rect x="2" y="94" width="96" height="6" />
    </G>
  ),
};

// Building height grows with company size.
export function heightFor(size) {
  if (size >= 21) return 1;
  if (size >= 11) return 0.85;
  if (size >= 6) return 0.68;
  return 0.5;
}

export default function Silhouette({ company, color, size, px }) {
  const s = heightFor(size);
  return (
    <Svg width={px} height={px} viewBox="0 0 100 100" style={{ position: 'absolute', left: 0, top: 0 }}>
      <G transform={`translate(50 100) scale(${s}) translate(-50 -100)`}>{SHAPES[company](color)}</G>
    </Svg>
  );
}

// The splash's "WANTED" poster: your alias and which magnate you play as. A bond-paper document
// (cream, double-ruled, slightly askew) with the chosen portrait large and the six to pick from below.
import { Pressable, TextInput, View } from 'react-native';
import Svg, {
  Defs, LinearGradient, RadialGradient, Rect, Stop,
} from 'react-native-svg';
import { T } from '../../theme/ui';
import Portrait from '../Portrait';
import {
  AVATARS, FONTS, GOLD, MIN_TARGET, TYCOON_EPITHETS, TYCOON_MOTTOS, TYCOON_TITLES,
} from '../../theme/tokens';
import { feel } from '../../feel/feel';

const PAPER = '#E9DCB8';
const INK = '#2A1D08';
const BROWN = '#4A3410';
const OCHRE = GOLD.burnish; // #6B4C15
const OXBLOOD = '#3A1A10';
const STAMP = '#9B1F27';

// The poster's foxing: two faint brown stains on the paper.
function Foxing() {
  return (
    <Svg style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 }} width="100%" height="100%">
      <Defs>
        <RadialGradient id="fox1" cx="20%" cy="15%" r="45%">
          <Stop offset="0" stopColor="#966E32" stopOpacity="0.25" />
          <Stop offset="1" stopColor="#966E32" stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id="fox2" cx="85%" cy="90%" r="50%">
          <Stop offset="0" stopColor="#78501E" stopOpacity="0.3" />
          <Stop offset="1" stopColor="#78501E" stopOpacity="0" />
        </RadialGradient>
      </Defs>
      <Rect width="100%" height="100%" fill="url(#fox1)" />
      <Rect width="100%" height="100%" fill="url(#fox2)" />
    </Svg>
  );
}

function Label({ children, style }) {
  return <T style={[{ fontFamily: FONTS.engraved, fontSize: 12, letterSpacing: 3 }, style]} color={OCHRE}>{children}</T>;
}

// One magnate to pick: portrait, title and epithet on a dark lacquer tile; the chosen one glows gold.
function MagnateTile({ index, on, onPress }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${TYCOON_TITLES[index]}, ${TYCOON_EPITHETS[index]}`}
      accessibilityState={{ selected: on }}
      onPress={() => { feel.select(); onPress(); }}
      style={({ pressed }) => ({ flexBasis: '30%', flexGrow: 1, transform: [{ translateY: pressed ? -3 : 0 }] })}
    >
      <View style={{
        alignItems: 'center', gap: 6, paddingTop: 12, paddingBottom: 10, paddingHorizontal: 6, overflow: 'hidden',
        backgroundColor: '#1E1813', borderWidth: on ? 3 : 1, borderColor: on ? GOLD.bright : GOLD.deep,
        margin: on ? -2 : 0, shadowColor: on ? GOLD.bright : '#000', shadowOpacity: on ? 0.7 : 0.4, shadowRadius: on ? 12 : 6,
        shadowOffset: { width: 0, height: on ? 0 : 6 }, elevation: on ? 8 : 3,
      }}
      >
        <Svg style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 }} width="100%" height="100%">
          <Defs>
            <LinearGradient id="tile" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#2A211A" />
              <Stop offset="1" stopColor="#14100C" />
            </LinearGradient>
          </Defs>
          <Rect width="100%" height="100%" fill="url(#tile)" />
        </Svg>
        <View pointerEvents="none" style={{ position: 'absolute', left: 3, top: 3, right: 3, bottom: 3, borderWidth: 1, borderColor: 'rgba(207,166,74,0.5)' }} />
        <Portrait index={index} size={56} ring={on} />
        <T style={{ fontFamily: FONTS.display, fontSize: 12, letterSpacing: 0.7, textAlign: 'center', lineHeight: 14 }} color={GOLD.bright} numberOfLines={2}>
          {TYCOON_TITLES[index].replace('The ', '')}
        </T>
        <T style={{ fontFamily: FONTS.accent, fontSize: 13, textAlign: 'center', lineHeight: 15 }} color="#B7A98C" numberOfLines={2}>
          {TYCOON_EPITHETS[index]}
        </T>
      </View>
    </Pressable>
  );
}

export default function WantedPoster({
  name, onName, avatar, onAvatar, compact,
}) {
  const sel = avatar % AVATARS.length;
  const big = compact ? 112 : 150;
  return (
    <View style={{
      backgroundColor: PAPER, padding: 12, borderWidth: 2, borderColor: OCHRE, transform: [{ rotate: '-0.6deg' }],
      shadowColor: '#000', shadowOpacity: 0.6, shadowRadius: 20, shadowOffset: { width: 0, height: 18 }, elevation: 12,
    }}
    >
      <Foxing />
      <View pointerEvents="none" style={{ position: 'absolute', left: -3, top: -3, right: -3, bottom: -3, borderWidth: 1, borderColor: GOLD.leaf }} />
      {/* A double rule: two thin borders with paper between them. */}
      <View style={{ borderWidth: 1, borderColor: BROWN, padding: 2 }}>
        <View style={{
          borderWidth: 1, borderColor: BROWN, paddingTop: 22, paddingHorizontal: compact ? 14 : 22, paddingBottom: 24, alignItems: 'center', gap: 14,
        }}
        >
          <T style={{ fontFamily: FONTS.display, fontSize: compact ? 40 : 46, letterSpacing: 6, lineHeight: compact ? 44 : 50 }} color={OXBLOOD}>WANTED</T>
          <T style={{ fontFamily: FONTS.accent, fontSize: 17, textAlign: 'center', marginTop: -6 }} color={BROWN}>
            for building the greatest railroad empire in the West
          </T>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 18, alignSelf: 'stretch' }}>
            <View style={{ width: big, height: big, flexShrink: 0 }}>
              <Portrait index={sel} size={big} ring />
              <View style={{
                position: 'absolute', right: -14, bottom: 10, transform: [{ rotate: '-12deg' }], paddingHorizontal: 6, paddingVertical: 2,
                borderWidth: 3, borderColor: STAMP, borderStyle: 'double', backgroundColor: 'rgba(243,233,204,0.85)',
              }}
              >
                <T style={{ fontFamily: FONTS.display, fontSize: 12, letterSpacing: 2 }} color={STAMP}>ENLISTED</T>
              </View>
            </View>
            <View style={{ flex: 1, gap: 6, minWidth: 0 }}>
              <T style={{ fontFamily: FONTS.engraved, fontSize: 11, letterSpacing: 2.8 }} color={OCHRE}>{TYCOON_EPITHETS[sel].toUpperCase()}</T>
              <T style={{ fontFamily: FONTS.display, fontSize: compact ? 22 : 28, letterSpacing: 1.2, lineHeight: compact ? 25 : 30 }} color={OXBLOOD}>
                {TYCOON_TITLES[sel]}
              </T>
              <T style={{ fontFamily: FONTS.accent, fontSize: compact ? 17 : 20, lineHeight: compact ? 21 : 24 }} color={BROWN}>
                “{TYCOON_MOTTOS[sel]}”
              </T>
            </View>
          </View>

          <View style={{ alignSelf: 'stretch', gap: 6 }}>
            <Label>ALIAS</Label>
            <TextInput
              value={name}
              onChangeText={onName}
              placeholder="Your name"
              placeholderTextColor="#8C7F66"
              maxLength={16}
              accessibilityLabel="Your name"
              autoCorrect={false}
              style={{
                minHeight: MIN_TARGET + 4, paddingHorizontal: 14, fontFamily: FONTS.uiMedium, fontSize: 18,
                color: INK, backgroundColor: '#F7EFD6', borderWidth: 1, borderColor: OCHRE,
              }}
            />
          </View>

          <Label style={{ alignSelf: 'stretch', marginBottom: -4 }}>CHOOSE YOUR MAGNATE</Label>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, alignSelf: 'stretch', paddingTop: 4 }}>
            {AVATARS.map((_, i) => <MagnateTile key={i} index={i} on={i === sel} onPress={() => onAvatar(i)} />)}
          </View>

          <View style={{ alignSelf: 'stretch', borderTopWidth: 1, borderColor: OCHRE, paddingTop: 12, alignItems: 'center' }}>
            <T style={{ fontFamily: FONTS.engraved, fontSize: 11, letterSpacing: 3.3 }} color={OCHRE}>REWARD · ONE WHOLE TOWN</T>
          </View>
        </View>
      </View>
    </View>
  );
}

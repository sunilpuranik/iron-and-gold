// A company tile with real depth: bevelled face, extruded side and a soft shadow.
import { View } from 'react-native';
import { useTheme } from '../theme/theme';
import { mix } from '../theme/tokens';
import { companyGlyph } from './CompanyIcon';

export default function RaisedTile({ id, size = 64, depth = Math.round(size * 0.1) }) {
  const th = useTheme();
  const c = th.companies[id];
  const Glyph = companyGlyph(id);
  const bevel = Math.max(2, Math.round(size * 0.055));
  const light = mix(c.fill, '#FFFFFF', 0.5);
  const dark = mix(c.fill, '#000000', 0.3);
  const side = mix(c.fill, '#000000', 0.38);
  return (
    <View style={{ width: size, height: size + depth + 6, alignItems: 'center' }}>
      <View
        style={{
          position: 'absolute', top: size + depth - 3, left: depth, width: size * 0.95, height: 10, borderRadius: size,
          backgroundColor: '#000000', opacity: 0.22,
        }}
      />
      {/* extruded side, offset down and to the right like a raised block */}
      <View
        style={{
          position: 'absolute', left: depth * 0.6, top: depth, width: size, height: size,
          backgroundColor: side, borderWidth: 1, borderColor: mix(side, '#000000', 0.4),
        }}
      />
      <View
        style={{
          width: size, height: size, backgroundColor: c.fill, alignItems: 'center', justifyContent: 'center',
          borderWidth: bevel, borderTopColor: light, borderLeftColor: light, borderBottomColor: dark, borderRightColor: dark,
        }}
      >
        <View style={{ position: 'absolute', left: 0, right: 0, top: 0, height: '45%', backgroundColor: '#FFFFFF', opacity: 0.12 }} />
        <Glyph size={Math.round(size * 0.55)} color={c.ink} strokeWidth={1.6} />
      </View>
    </View>
  );
}

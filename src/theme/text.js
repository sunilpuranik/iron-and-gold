import { Text } from 'react-native';
import { useTheme } from './theme';
import { FONTS } from './tokens';

const VARIANTS = {
  display: { fontFamily: FONTS.display, fontSize: 22 },
  title: { fontFamily: FONTS.display, fontSize: 18 },
  accent: { fontFamily: FONTS.accent, fontSize: 15 },
  body: { fontFamily: FONTS.ui, fontSize: 14 },
  label: { fontFamily: FONTS.uiMedium, fontSize: 12, letterSpacing: 0.4 },
  small: { fontFamily: FONTS.ui, fontSize: 11 },
  strong: { fontFamily: FONTS.uiSemi, fontSize: 14 },
  plate: { fontFamily: FONTS.engraved, fontSize: 15, letterSpacing: 0.6 },
};

export function T({ v = 'body', color, style, ...rest }) {
  const th = useTheme();
  return <Text {...rest} style={[VARIANTS[v], { color: color || th.ink }, style]} />;
}

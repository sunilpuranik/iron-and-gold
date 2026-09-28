import { Text } from 'react-native';
import { useTheme } from './theme';
import { TYPE } from './tokens';

const VARIANTS = {
  ...TYPE,
  plate: { ...TYPE.plate, textTransform: 'uppercase' },
};

// hero is gilt by default; everything else is ink.
export function T({ v = 'body', color, style, ...rest }) {
  const th = useTheme();
  const fallback = v === 'hero' ? th.money : th.ink;
  return <Text {...rest} style={[VARIANTS[v], { color: color || fallback }, style]} />;
}

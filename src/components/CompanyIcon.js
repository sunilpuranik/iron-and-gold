import { View } from 'react-native';
import {
  Factory, Fuel, Landmark, Lightbulb, RadioTower, Ship, TrainFront,
} from 'lucide-react-native';
import { useTheme } from '../theme/theme';
import { company } from '../game/data';

const ICONS = { RadioTower, Ship, TrainFront, Fuel, Lightbulb, Factory, Landmark };

// The one icon used for a company everywhere: board plots, deeds, market, sheets.
export function companyGlyph(id) {
  return ICONS[company(id).icon];
}

// Company badge: company fill + ink icon, square, hairline border.
export default function CompanyIcon({ id, size = 32 }) {
  const th = useTheme();
  const c = th.companies[id];
  const Icon = companyGlyph(id);
  return (
    <View
      style={{
        width: size, height: size, backgroundColor: c.fill, borderWidth: 1, borderColor: th.ink,
        alignItems: 'center', justifyContent: 'center',
      }}
    >
      <Icon size={size * 0.6} color={c.ink} strokeWidth={1.5} />
    </View>
  );
}

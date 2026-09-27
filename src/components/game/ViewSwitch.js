// Compact Map ⇄ Exchange switch that lives in the header (it replaces the old "your turn" banner).
// The game flips to the map when it's your turn and to the exchange while others play.
import { Pressable, View } from 'react-native';
import { ChartColumn, Map as MapIcon } from 'lucide-react-native';
import { useTheme } from '../../theme/theme';
import { IronFill } from '../../theme/brand';
import { feel } from '../../feel/feel';

function Seg({
  on, icon: Icon, onPress, label, flag,
}) {
  const th = useTheme();
  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected: on }}
      accessibilityLabel={label}
      hitSlop={{ top: 6, bottom: 6 }}
      onPress={() => {
        if (!on) feel.select();
        onPress();
      }}
      style={{
        width: 42, height: 38, alignItems: 'center', justifyContent: 'center',
        backgroundColor: th.ledger, overflow: 'hidden',
      }}
    >
      {on && <IronFill />}
      <View>
        <Icon size={19} color={on ? th.iron.text : th.ink} strokeWidth={1.75} />
      </View>
      {flag && (
        <View
          style={{
            position: 'absolute', top: 4, right: 4, width: 8, height: 8, borderRadius: 4,
            backgroundColor: th.gilt, borderWidth: 1, borderColor: th.goldLeaf.lo,
          }}
        />
      )}
    </Pressable>
  );
}

export default function ViewSwitch({ view, onView, mine }) {
  const th = useTheme();
  return (
    <View style={{ flexDirection: 'row', borderWidth: 1.5, borderColor: th.iron.mid }}>
      <Seg on={view === 'map'} icon={MapIcon} label="Show the map" onPress={() => onView('map')} flag={mine && view !== 'map'} />
      <View style={{ width: 1.5, backgroundColor: th.iron.mid }} />
      <Seg on={view === 'exchange'} icon={ChartColumn} label="Show the exchange" onPress={() => onView('exchange')} />
    </View>
  );
}

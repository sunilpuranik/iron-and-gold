// v1 name for the header's Map ⇄ Exchange switch, kept until the cleanup pass.
import { ChartColumn, Map as MapIcon } from 'lucide-react-native';
import Tabs from './Tabs';

export default function ViewSwitch({ view, onView, mine }) {
  return (
    <Tabs
      kind="switch"
      value={view}
      onChange={onView}
      items={[
        { key: 'map', label: 'Show the map', icon: MapIcon, flag: mine && view !== 'map' },
        { key: 'exchange', label: 'Show the exchange', icon: ChartColumn },
      ]}
    />
  );
}

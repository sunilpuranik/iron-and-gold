import { Pressable, View } from 'react-native';
import { useTheme } from '../../theme/theme';
import { T } from '../../theme/ui';
import { MIN_TARGET } from '../../theme/tokens';
import { feel } from '../../feel/feel';

export const TAB_NAMES = ['Deeds', 'Market', 'Tycoons', 'Ticker'];
export const TAB_BODY_HEIGHT = 170;

export default function Tabs({ tab, onTab }) {
  const th = useTheme();
  return (
    <View style={{ flexDirection: 'row', borderTopWidth: 1, borderBottomWidth: 1, borderColor: th.ink }}>
      {TAB_NAMES.map((name, i) => {
        const on = tab === name;
        return (
          <Pressable
            key={name}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            onPress={() => {
              if (!on) feel.select();
              onTab(name);
            }}
            style={{
              flex: 1, minHeight: MIN_TARGET, alignItems: 'center', justifyContent: 'center',
              backgroundColor: on ? th.ledger : th.paper,
              borderLeftWidth: i ? 1 : 0, borderColor: th.rule,
            }}
          >
            <T v={on ? 'strong' : 'body'} color={on ? th.ink : th.inkSoft}>{name}</T>
            {on && <View style={{ position: 'absolute', bottom: 0, left: 12, right: 12, height: 2, backgroundColor: th.ink }} />}
          </Pressable>
        );
      })}
    </View>
  );
}

import { View } from 'react-native';
import { Bell, Hammer, Landmark } from 'lucide-react-native';
import { useTheme } from '../../theme/theme';
import { Button, T } from '../../theme/ui';
import { districtOf } from '../../game/data';

const DECIDE = { found: 'Charter a company', survivor: 'Choose survivor', dispose: 'Settle shares' };

export default function ActionBar({
  phase, mine, actorName, selected, canBell, onBuild, onInvest, onPass, onBell, onDecide, onResults,
}) {
  const th = useTheme();
  let body;
  if (phase === 'over') {
    body = <Button title="Closing bell results" kind="secondary" icon={Bell} onPress={onResults} style={{ flex: 1 }} />;
  } else if (!mine) {
    body = (
      <View style={{ flex: 1, minHeight: 44, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: th.rule }}>
        <T v="accent" color={th.inkSoft}>Waiting on {actorName}…</T>
      </View>
    );
  } else if (phase === 'place') {
    body = (
      <Button
        title={selected ? `Build on ${selected} · ${districtOf(selected).name}` : 'Tap a deed to build'}
        icon={Hammer}
        disabled={!selected}
        onPress={() => onBuild(selected)}
        style={{ flex: 1 }}
      />
    );
  } else if (phase === 'buy') {
    body = (
      <>
        <Button title="Pass" kind="tertiary" onPress={onPass} compact />
        {canBell && <Button title="Bell" kind="secondary" icon={Bell} onPress={onBell} compact />}
        <Button title="Invest" icon={Landmark} onPress={onInvest} style={{ flex: 1 }} />
      </>
    );
  } else {
    body = <Button title={DECIDE[phase]} onPress={onDecide} style={{ flex: 1 }} />;
  }
  return (
    <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 12, paddingTop: 8, paddingBottom: 8, borderTopWidth: 1, borderColor: th.rule }}>
      {body}
    </View>
  );
}

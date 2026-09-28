// Full-screen cover between human turns in pass-and-play, with a recap of the turns they missed.
import { Modal, ScrollView } from 'react-native';
import { useTheme } from '../../theme/theme';
import { Button, Rule, T } from '../../theme/ui';
import Portrait from '../Portrait';
import Dispatch from './Dispatch';

export default function HandoffCover({ player, recap = [], onReady }) {
  const th = useTheme();
  return (
    <Modal visible={!!player} animationType="fade" onRequestClose={() => {}} statusBarTranslucent>
      {player && (
        <ScrollView
          style={{ flex: 1, backgroundColor: th.paper }}
          contentContainerStyle={{ flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 28, paddingTop: 64, gap: 16 }}
        >
          <T v="accent" color={th.inkSoft}>Pass the telegraph along</T>
          <Portrait index={player.avatar} size={112} />
          <T v="display" style={{ fontSize: 30, textAlign: 'center' }}>Hand to {player.name}</T>
          <Rule kind="ornament" style={{ alignSelf: 'stretch' }} />
          <T v="body" color={th.inkSoft} style={{ textAlign: 'center' }}>
            Everyone else, look away — your deeds are private.
          </T>
          <Button title={`I am ${player.name}`} onPress={onReady} style={{ alignSelf: 'stretch' }} />
          <Dispatch as="recap" dispatches={recap} />
        </ScrollView>
      )}
    </Modal>
  );
}

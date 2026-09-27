// Full-screen cover between human turns in pass-and-play.
import { Modal, View } from 'react-native';
import { useTheme } from '../../theme/theme';
import { Button, DoubleRule, T } from '../../theme/ui';
import Avatar from '../Avatar';

export default function HandoffCover({ player, onReady }) {
  const th = useTheme();
  return (
    <Modal visible={!!player} animationType="fade" onRequestClose={() => {}} statusBarTranslucent>
      {player && (
        <View style={{ flex: 1, backgroundColor: th.paper, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 18 }}>
          <T v="accent" color={th.inkSoft}>Pass the telegraph along</T>
          <Avatar index={player.avatar} size={72} />
          <T v="display" style={{ fontSize: 30, textAlign: 'center' }}>Hand to {player.name}</T>
          <DoubleRule style={{ alignSelf: 'stretch' }} />
          <T v="body" color={th.inkSoft} style={{ textAlign: 'center' }}>
            Everyone else, look away — your deeds are private.
          </T>
          <Button title={`I am ${player.name}`} onPress={onReady} style={{ alignSelf: 'stretch' }} />
        </View>
      )}
    </Modal>
  );
}

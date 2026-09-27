// Bottom sheet built on Modal. Pass onClose to make it dismissable.
import { Modal, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import { useTheme } from '../../theme/theme';
import { DoubleRule, IconButton, T } from '../../theme/ui';

export default function Sheet({
  visible, title, subtitle, onClose, children, footer,
}) {
  const th = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose || (() => {})} statusBarTranslucent>
      <View style={{ flex: 1, justifyContent: 'flex-end' }}>
        <Pressable style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: th.scrim }} onPress={onClose} />
        <View style={{ backgroundColor: th.paper, borderTopWidth: 1, borderColor: th.ink, maxHeight: '82%', paddingBottom: insets.bottom + 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingLeft: 16, paddingTop: 8, minHeight: 52 }}>
            <View style={{ flex: 1 }}>
              <T v="display">{title}</T>
              {subtitle ? <T v="accent" color={th.inkSoft}>{subtitle}</T> : null}
            </View>
            {onClose && <IconButton icon={X} label="Close" onPress={onClose} />}
          </View>
          <DoubleRule style={{ marginHorizontal: 16, marginTop: 6 }} />
          <ScrollView contentContainerStyle={{ padding: 16, gap: 10 }}>{children}</ScrollView>
          {footer ? <View style={{ paddingHorizontal: 16, gap: 8 }}>{footer}</View> : null}
        </View>
      </View>
    </Modal>
  );
}

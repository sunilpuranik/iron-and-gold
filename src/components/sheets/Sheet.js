// Bottom sheet built on Modal: a raised lacquer panel under a gold-leaf edge. Pass onClose to make it dismissable.
import { Modal, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import { useTheme } from '../../theme/theme';
import { Button, Rule, T } from '../../theme/ui';

export default function Sheet({
  visible, title, subtitle, onClose, children, footer,
}) {
  const th = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose || (() => {})} statusBarTranslucent>
      <View style={{ flex: 1, justifyContent: 'flex-end' }}>
        <Pressable style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: th.scrim }} onPress={onClose} />
        <View
          style={{
            backgroundColor: th.raised, maxHeight: '86%', paddingBottom: insets.bottom + 12,
            borderTopWidth: 3, borderColor: th.accent,
            shadowColor: '#000', shadowOpacity: 0.7, shadowRadius: 20, shadowOffset: { width: 0, height: -10 }, elevation: 12,
          }}
        >
          <View style={{ position: 'absolute', left: 0, right: 0, top: -4, height: 1, backgroundColor: th.gold.shine }} />
          <View style={{ width: 40, height: 4, backgroundColor: th.field, alignSelf: 'center', marginTop: 10 }} />
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingLeft: 18, paddingRight: 6, paddingTop: 6, minHeight: 52 }}>
            <View style={{ flex: 1 }}>
              <T v="display" style={{ fontSize: 22 }}>{title}</T>
              {subtitle ? <T v="accent" color={th.inkSoft} style={{ fontSize: 15 }}>{subtitle}</T> : null}
            </View>
            {onClose && <Button iconOnly icon={X} label="Close" onPress={onClose} />}
          </View>
          <Rule kind="gilt" style={{ marginHorizontal: 18, marginTop: 8 }} />
          <ScrollView contentContainerStyle={{ paddingHorizontal: 18, paddingVertical: 16, gap: 12 }}>{children}</ScrollView>
          {footer ? <View style={{ paddingHorizontal: 18, gap: 8 }}>{footer}</View> : null}
        </View>
      </View>
    </Modal>
  );
}

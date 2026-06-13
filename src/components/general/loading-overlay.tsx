import { ActivityIndicator, Modal, View } from "react-native";
import { AppText } from "@/components/ui/app-text";
import { colors, radius } from "@/components/ui/design-system";

export function LoadingOverlay({ visible, label = "Please wait" }: { visible: boolean; label?: string }) {
  return (
    <Modal transparent visible={visible} animationType="fade">
      <View className="flex-1 items-center justify-center bg-black/30 px-6">
        <View className="w-full max-w-sm items-center px-6 py-8" style={{ borderRadius: radius.xl, backgroundColor: colors.surface }}>
          <ActivityIndicator color={colors.primary} size="large" />
          <AppText className="mt-4 text-center" style={{ fontFamily: "Manrope_700Bold" }}>
            {label}
          </AppText>
        </View>
      </View>
    </Modal>
  );
}

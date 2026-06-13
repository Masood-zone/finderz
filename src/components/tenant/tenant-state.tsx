import { RefreshCcw, SearchX } from "lucide-react-native";
import { View } from "react-native";
import { AppButton } from "@/components/ui/app-button";
import { AppText } from "@/components/ui/app-text";
import { colors, radius } from "@/components/ui/design-system";

export function TenantSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <View className="gap-4 px-4 py-6">
      {Array.from({ length: rows }).map((_, index) => (
        <View key={index} className="h-40" style={{ borderRadius: radius.xl, backgroundColor: colors.surfaceBlue }} />
      ))}
    </View>
  );
}

export function TenantEmptyState({ title, message, actionTitle, onAction }: { title: string; message: string; actionTitle?: string; onAction?: () => void }) {
  return (
    <View className="items-center justify-center px-6 py-12">
      <View className="h-20 w-20 items-center justify-center" style={{ borderRadius: radius.xxl, backgroundColor: colors.surfaceBlue }}>
        <SearchX color={colors.primary} size={38} />
      </View>
      <AppText variant="title" className="mt-5 text-center">
        {title}
      </AppText>
      <AppText muted className="mt-2 text-center">
        {message}
      </AppText>
      {actionTitle && onAction ? (
        <View className="mt-5 w-full">
          <AppButton title={actionTitle} onPress={onAction} />
        </View>
      ) : null}
    </View>
  );
}

export function TenantErrorState({ title = "Unable to load", message, onRetry }: { title?: string; message: string; onRetry: () => void }) {
  return (
    <View className="items-center justify-center px-6 py-12">
      <View className="h-20 w-20 items-center justify-center" style={{ borderRadius: radius.xxl, backgroundColor: colors.errorSoft }}>
        <RefreshCcw color={colors.error} size={34} />
      </View>
      <AppText variant="title" className="mt-5 text-center">
        {title}
      </AppText>
      <AppText muted className="mt-2 text-center">
        {message}
      </AppText>
      <View className="mt-5 w-full">
        <AppButton title="Retry" variant="secondary" onPress={onRetry} />
      </View>
    </View>
  );
}

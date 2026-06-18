import { router } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import type { ReactNode } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppText } from "@/components/ui/app-text";
import { colors, radius } from "@/components/ui/design-system";
import { FinderzLogo } from "@/components/ui/finderz-logo";
import { TenantAvatar } from "@/components/tenant/tenant-shell";

const steps = [
  { title: "Basic Information", shortTitle: "Basics" },
  { title: "Location & Pricing", shortTitle: "Location" },
  { title: "Final Details", shortTitle: "Final" },
];

type AddPropertyShellProps = {
  children: ReactNode;
  currentStep: 1 | 2 | 3;
  footer?: ReactNode;
  right?: ReactNode;
  userName?: string;
  userImage?: string | null;
};

export function AddPropertyShell({ children, currentStep, footer, right, userName, userImage }: AddPropertyShellProps) {
  const insets = useSafeAreaInsets();
  const percent = Math.round((currentStep / steps.length) * 100);
  const step = steps[currentStep - 1];

  return (
    <View className="flex-1" style={{ backgroundColor: "#f8f9ff" }}>
      <View
        className="flex-row items-center justify-between border-b px-4 pb-3"
        style={{
          paddingTop: Math.max(insets.top, 12),
          backgroundColor: colors.surface,
          borderColor: colors.border,
        }}
      >
        <View className="min-w-0 flex-1 flex-row items-center gap-3">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            className="h-10 w-10 items-center justify-center"
            style={{ borderRadius: 999, backgroundColor: colors.surfaceBlue }}
            onPress={() => (router.canGoBack() ? router.back() : router.replace("/landlord"))}
          >
            <ArrowLeft color={colors.primary} size={20} />
          </Pressable>
          <View className="min-w-0 flex-1">
            <AppText variant="title" numberOfLines={1} style={{ color: colors.primary }}>
              Add Property
            </AppText>
            <AppText variant="caption" muted numberOfLines={1}>
              Step {currentStep} of 3
            </AppText>
          </View>
        </View>
        {right ?? (userName ? <TenantAvatar name={userName} image={userImage} size={36} /> : <FinderzLogo variant="mark" size="sm" />)}
      </View>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 20,
          paddingBottom: footer ? 112 + insets.bottom : 28 + insets.bottom,
        }}
      >
        <View className="mx-auto w-full max-w-[720px]">
          <View className="mb-6">
            <View className="mb-2 flex-row items-end justify-between gap-3">
              <View className="min-w-0 flex-1">
                <AppText variant="label" style={{ color: colors.primary }}>
                  Step {currentStep} of 3
                </AppText>
                <AppText variant="title" numberOfLines={1}>
                  {step.title}
                </AppText>
              </View>
              <AppText variant="label" muted>
                {percent}% Complete
              </AppText>
            </View>
            <View className="h-2 overflow-hidden rounded-full" style={{ backgroundColor: "#dce9ff" }}>
              <View className="h-2 rounded-full" style={{ width: `${percent}%`, backgroundColor: currentStep === 2 ? colors.primary : colors.gold }} />
            </View>
            <View className="mt-3 flex-row gap-2">
              {steps.map((item, index) => {
                const active = index + 1 <= currentStep;
                return (
                  <View key={item.shortTitle} className="min-w-0 flex-1 rounded-full px-2 py-1" style={{ backgroundColor: active ? colors.surfaceBlue : colors.surface }}>
                    <AppText variant="caption" numberOfLines={1} style={{ color: active ? colors.primary : colors.muted, fontFamily: "Manrope_700Bold", textAlign: "center" }}>
                      {item.shortTitle}
                    </AppText>
                  </View>
                );
              })}
            </View>
          </View>

          {children}
        </View>
      </ScrollView>

      {footer ? (
        <View
          className="absolute bottom-0 left-0 right-0 border-t px-4 pt-3"
          style={{
            paddingBottom: Math.max(insets.bottom, 12),
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderTopLeftRadius: radius.xl,
            borderTopRightRadius: radius.xl,
          }}
        >
          <View className="mx-auto w-full max-w-[720px]">{footer}</View>
        </View>
      ) : null}
    </View>
  );
}

export function AddPropertyPanel({ children }: { children: ReactNode }) {
  return (
    <View
      className="rounded-2xl border p-5"
      style={{
        backgroundColor: colors.surface,
        borderColor: "rgba(197,197,211,0.7)",
      }}
    >
      {children}
    </View>
  );
}

export function AddPropertyNote({ children }: { children: ReactNode }) {
  return (
    <View className="rounded-xl p-4" style={{ backgroundColor: "#dce9ff" }}>
      {children}
    </View>
  );
}

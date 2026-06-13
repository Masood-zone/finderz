import { Pressable, View } from "react-native";
import type { ReactNode } from "react";
import { AppButton } from "@/components/ui/app-button";
import { AppText } from "@/components/ui/app-text";
import { colors, radius } from "@/components/ui/design-system";
import { FinderzLogo } from "@/components/ui/finderz-logo";
import { ProgressDots } from "@/components/ui/progress-dots";
import { SafeAreaScreen } from "@/components/ui/safe-area-screen";

type OnboardingSlideProps = {
  title: string;
  subtitle: string;
  icon: ReactNode;
  index: number;
  buttonTitle: string;
  onNext: () => void;
  onSkip: () => void;
};

export function OnboardingSlide({ title, subtitle, icon, index, buttonTitle, onNext, onSkip }: OnboardingSlideProps) {
  return (
    <SafeAreaScreen>
      <View className="flex-1 px-6 py-5">
        <View className="flex-row items-center justify-between">
          <FinderzLogo variant="text" size="sm" />
          <Pressable accessibilityRole="button" onPress={onSkip} className="px-3 py-2">
            <AppText style={{ color: colors.primary, fontFamily: "Manrope_700Bold" }}>Skip</AppText>
          </Pressable>
        </View>

        <View className="flex-1 justify-center">
          <View className="items-center">
            <View
              className="h-72 w-full max-w-sm items-center justify-center overflow-hidden"
              style={{
                borderRadius: radius.xxl,
                backgroundColor: colors.surfaceBlue,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <View className="absolute -right-10 -top-10 h-36 w-36 rounded-full" style={{ backgroundColor: colors.gold }} />
              <View className="absolute -bottom-12 -left-12 h-44 w-44 rounded-full" style={{ backgroundColor: "#dbe6ff" }} />
              {icon}
            </View>

            <AppText variant="display" className="mt-10 text-center">
              {title}
            </AppText>
            <AppText muted className="mt-4 text-center">
              {subtitle}
            </AppText>
          </View>
        </View>

        <View className="gap-6 pb-4">
          <ProgressDots total={3} index={index} />
          <AppButton title={buttonTitle} onPress={onNext} />
        </View>
      </View>
    </SafeAreaScreen>
  );
}

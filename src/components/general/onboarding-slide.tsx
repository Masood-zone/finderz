import { AppButton } from "@/components/ui/app-button";
import { AppText } from "@/components/ui/app-text";
import { colors, radius } from "@/components/ui/design-system";
import { FinderzLogo } from "@/components/ui/finderz-logo";
import { ProgressDots } from "@/components/ui/progress-dots";
import type { ReactNode } from "react";
import { Pressable, View } from "react-native";

type OnboardingSlideProps = {
  title: string;
  subtitle: string;
  icon: ReactNode;
  index: number;
  buttonTitle: string;
  onNext: () => void;
  onSkip: () => void;
};

export function OnboardingSlide({
  title,
  subtitle,
  icon,
  index,
  buttonTitle,
  onNext,
  onSkip,
}: OnboardingSlideProps) {
  return (
    // //<SafeAreaScreen scroll>
    <View className="flex-1 px-6 pt-4 pb-6">
      <View className="flex-row items-center justify-between">
        <FinderzLogo variant="text" size="sm" />
        <Pressable
          accessibilityRole="button"
          onPress={onSkip}
          className="px-3 py-2"
        >
          <AppText
            style={{ color: colors.primary, fontFamily: "Manrope_700Bold" }}
          >
            Skip
          </AppText>
        </Pressable>
      </View>

      <View className="flex-1 justify-center">
        <View className="items-center">
          <View
            className="w-full max-w-sm items-center justify-center overflow-hidden"
            style={{
              aspectRatio: 1.08,
              minHeight: 360,
              borderRadius: radius.xxl,
              backgroundColor: colors.surfaceBlue,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <View
              className="absolute -right-10 -top-10 h-36 w-36 rounded-full"
              style={{ backgroundColor: colors.gold }}
            />
            <View
              className="absolute -bottom-12 -left-12 h-44 w-44 rounded-full"
              style={{ backgroundColor: "#dbe6ff" }}
            />
            {icon}
          </View>

          <AppText
            variant="headline"
            className="mt-8 max-w-[320px] text-center"
          >
            {title}
          </AppText>
          <AppText muted className="mt-3 max-w-[320px] text-center leading-7">
            {subtitle}
          </AppText>
        </View>
      </View>

      <View className="gap-5 pt-4">
        <ProgressDots total={3} index={index} />
        <AppButton title={buttonTitle} onPress={onNext} variant="primary" />
      </View>
    </View>
    ////<SafeAreaScreen scroll>
  );
}

import { useEffect } from "react";
import { View } from "react-native";
import { router } from "expo-router";
import { FinderzLogo } from "@/components/ui/finderz-logo";
import { AppText } from "@/components/ui/app-text";
import { colors } from "@/components/ui/design-system";
import { SafeAreaScreen } from "@/components/ui/safe-area-screen";
import { useOnboardingStore } from "@/store/onboarding-store";

export default function SplashScreenRoute() {
  const hasSeenPublicOnboarding = useOnboardingStore((state) => state.hasSeenPublicOnboarding);

  useEffect(() => {
    const timeout = setTimeout(() => {
      router.replace(hasSeenPublicOnboarding ? "/sign-in" : "/onboarding/find-housing");
    }, 1300);

    return () => clearTimeout(timeout);
  }, [hasSeenPublicOnboarding]);

  return (
    <SafeAreaScreen style={{ backgroundColor: colors.primary }}>
      <View className="flex-1 items-center justify-center px-8">
        <View className="absolute left-[-48px] top-[-32px] h-40 w-40 rounded-full bg-white/10" />
        <View className="absolute bottom-[-64px] right-[-40px] h-52 w-52 rounded-full bg-white/10" />
        <FinderzLogo variant="mark" size="lg" />
        <FinderzLogo variant="text" size="md" />
        <AppText className="mt-6 text-center" style={{ color: "#fff", fontFamily: "Manrope_700Bold" }}>
          For Your No.1 Housing Needs and Services
        </AppText>
        <View className="mt-10 flex-row gap-2">
          {[0, 1, 2].map((dot) => (
            <View key={dot} className="h-2 w-2 rounded-full" style={{ backgroundColor: dot === 1 ? colors.gold : "rgba(255,255,255,0.45)" }} />
          ))}
        </View>
      </View>
    </SafeAreaScreen>
  );
}

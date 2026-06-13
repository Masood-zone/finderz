import { Building2, ChartNoAxesColumnIncreasing, KeyRound } from "lucide-react-native";
import { router } from "expo-router";
import { View } from "react-native";
import { OnboardingSlide } from "@/components/general/onboarding-slide";
import { colors, radius } from "@/components/ui/design-system";
import { useOnboardingStore } from "@/store/onboarding-store";

function Illustration() {
  return (
    <View className="items-center justify-center">
      <View className="h-28 w-28 items-center justify-center" style={{ borderRadius: radius.xxl, backgroundColor: colors.primary }}>
        <Building2 color="#fff" size={58} />
      </View>
      <View className="absolute -right-12 -top-8 h-16 w-16 items-center justify-center rounded-full" style={{ backgroundColor: colors.gold }}>
        <KeyRound color={colors.goldDark} size={30} />
      </View>
      <View className="absolute -bottom-8 -left-10 h-14 w-14 items-center justify-center rounded-full bg-white">
        <ChartNoAxesColumnIncreasing color={colors.primary} size={26} />
      </View>
    </View>
  );
}

export default function ListPropertiesOnboardingScreen() {
  const setHasSeenPublicOnboarding = useOnboardingStore((state) => state.setHasSeenPublicOnboarding);

  const finish = () => {
    setHasSeenPublicOnboarding(true);
    router.replace("/role-selection");
  };

  return (
    <OnboardingSlide
      title="List and Manage Properties"
      subtitle="Publish vacancies, manage enquiries, and keep every listing updated from your phone."
      icon={<Illustration />}
      index={2}
      buttonTitle="Get Started"
      onNext={finish}
      onSkip={finish}
    />
  );
}

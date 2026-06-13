import { Home, MapPin, Search } from "lucide-react-native";
import { router } from "expo-router";
import { View } from "react-native";
import { OnboardingSlide } from "@/components/general/onboarding-slide";
import { colors, radius } from "@/components/ui/design-system";
import { useOnboardingStore } from "@/store/onboarding-store";

function Illustration() {
  return (
    <View className="items-center justify-center">
      <View className="h-28 w-28 items-center justify-center" style={{ borderRadius: radius.xxl, backgroundColor: colors.primary }}>
        <Home color="#fff" size={58} />
      </View>
      <View className="absolute -right-10 -top-8 h-16 w-16 items-center justify-center rounded-full" style={{ backgroundColor: colors.gold }}>
        <Search color={colors.goldDark} size={28} />
      </View>
      <View className="absolute -bottom-8 -left-10 h-14 w-14 items-center justify-center rounded-full bg-white">
        <MapPin color={colors.primary} size={26} />
      </View>
    </View>
  );
}

export default function FindHousingOnboardingScreen() {
  const setHasSeenPublicOnboarding = useOnboardingStore((state) => state.setHasSeenPublicOnboarding);

  const skip = () => {
    setHasSeenPublicOnboarding(true);
    router.replace("/role-selection");
  };

  return (
    <OnboardingSlide
      title="Find Affordable Housing"
      subtitle="Search verified rentals, compare locations, and save homes that fit your budget across Ghana."
      icon={<Illustration />}
      index={0}
      buttonTitle="Next"
      onNext={() => router.push("/onboarding/connect")}
      onSkip={skip}
    />
  );
}

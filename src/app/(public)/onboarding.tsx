import { useEffect } from "react";
import { router } from "expo-router";
import { LoadingScreen } from "@/components/shared/loading-screen";

export default function PublicOnboardingScreen() {
  useEffect(() => {
    router.replace("/onboarding/find-housing");
  }, []);

  return <LoadingScreen />;
}

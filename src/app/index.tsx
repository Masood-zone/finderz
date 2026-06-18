import { useEffect } from "react";
import { router } from "expo-router";
import type { Href } from "expo-router";
import { LoadingScreen } from "@/components/shared/loading-screen";
import { useTypedSession } from "@/lib/auth-client";
import { useOnboardingStore } from "@/store/onboarding-store";

export default function Index() {
  const session = useTypedSession();
  const user = session.data?.user;
  const hasSeenPublicOnboarding = useOnboardingStore((state) => state.hasSeenPublicOnboarding);
  const onboardingHydrated = useOnboardingStore.persist.hasHydrated();
  let redirectHref: Href | null = null;

  if (!session.isPending && onboardingHydrated) {
    if (!user) {
      redirectHref = hasSeenPublicOnboarding ? "/sign-in" : "/splash";
    } else if (user.accountStatus !== "ACTIVE") {
      redirectHref = "/account-status";
    } else if (!user.onboardingCompleted) {
      redirectHref = "/role-selection";
    } else if (user.role === "LANDLORD") {
      redirectHref = "/landlord" as Href;
    } else if (user.role === "SUPER_ADMIN") {
      redirectHref = "/super-admin/dashboard";
    } else {
      redirectHref = "/tenant";
    }
  }

  useEffect(() => {
    if (redirectHref) {
      router.replace(redirectHref);
    }
  }, [redirectHref]);

  return <LoadingScreen />;
}

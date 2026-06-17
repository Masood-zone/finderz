import { useEffect } from "react";
import { router } from "expo-router";
import type { Href } from "expo-router";
import { LoadingScreen } from "@/components/shared/loading-screen";
import { useTypedSession } from "@/lib/auth-client";

export default function Index() {
  const session = useTypedSession();
  const user = session.data?.user;
  let redirectHref: Href | null = null;

  if (!session.isPending) {
    if (!user) {
      redirectHref = "/splash";
    } else if (user.accountStatus !== "ACTIVE") {
      redirectHref = "/account-status";
    } else if (!user.onboardingCompleted) {
      redirectHref = "/role-selection";
    } else if (user.role === "LANDLORD") {
      redirectHref = "/landlord/dashboard";
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

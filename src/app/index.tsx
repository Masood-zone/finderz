import { Redirect } from "expo-router";
import { LoadingScreen } from "@/components/shared/loading-screen";
import { useTypedSession } from "@/lib/auth-client";

export default function Index() {
  const session = useTypedSession();
  const user = session.data?.user;

  if (session.isPending) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Redirect href="/onboarding" />;
  }

  if (user.accountStatus === "SUSPENDED") {
    return <Redirect href="/account-status" />;
  }

  if (!user.onboardingCompleted) {
    return <Redirect href="/role-selection" />;
  }

  if (user.role === "LANDLORD") {
    return <Redirect href="/landlord/dashboard" />;
  }

  if (user.role === "SUPER_ADMIN") {
    return <Redirect href="/super-admin/dashboard" />;
  }

  return <Redirect href="/tenant/dashboard" />;
}

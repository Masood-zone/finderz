import { useEffect } from "react";
import { router, Stack, usePathname } from "expo-router";
import type { Href } from "expo-router";
import { LoadingScreen } from "./loading-screen";
import { useTypedSession } from "@/lib/auth-client";
import type { AppRole, AuthSessionUser } from "@/types/auth";

type RouteGuardProps = {
  allowSignedOut?: boolean;
  signedOutOnly?: boolean;
  roles?: readonly AppRole[];
};

function getRoleHome(role: AppRole) {
  if (role === "TENANT") {
    return "/tenant";
  }

  if (role === "LANDLORD") {
    return "/landlord/dashboard";
  }

  return "/super-admin/dashboard";
}

function getSessionUser(user: AuthSessionUser | undefined) {
  return user;
}

export function RouteGuard({ allowSignedOut = false, signedOutOnly = false, roles }: RouteGuardProps) {
  const session = useTypedSession();
  const user = getSessionUser(session.data?.user);
  const pathname = usePathname();
  const isPending = Boolean(session.isPending);
  let redirectHref: Href | null = null;

  if (signedOutOnly && user) {
    if (user.accountStatus === "SUSPENDED") {
      redirectHref = "/account-status";
    } else if (!user.onboardingCompleted) {
      redirectHref = "/role-selection";
    } else {
      redirectHref = getRoleHome(user.role);
    }
  } else if (!allowSignedOut && !user) {
    redirectHref = "/sign-in";
  } else if (user?.accountStatus === "SUSPENDED") {
    redirectHref = "/account-status";
  } else if (user && !user.onboardingCompleted && roles?.length) {
    redirectHref = "/role-selection";
  } else if (user && roles?.length && !roles.includes(user.role)) {
    redirectHref = user.onboardingCompleted ? getRoleHome(user.role) : "/role-selection";
  }

  const shouldRedirect = Boolean(redirectHref && pathname !== redirectHref);

  useEffect(() => {
    if (shouldRedirect && redirectHref) {
      router.replace(redirectHref);
    }
  }, [redirectHref, shouldRedirect]);

  if (isPending || shouldRedirect) {
    return <LoadingScreen />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}

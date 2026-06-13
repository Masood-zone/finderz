import { Redirect, Stack } from "expo-router";
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
    return "/tenant/index";
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
  const isPending = Boolean(session.isPending);

  if (isPending) {
    return <LoadingScreen />;
  }

  if (signedOutOnly && user) {
    if (user.accountStatus === "SUSPENDED") {
      return <Redirect href="/account-status" />;
    }

    if (!user.onboardingCompleted) {
      return <Redirect href="/role-selection" />;
    }

    return <Redirect href={getRoleHome(user.role)} />;
  }

  if (!allowSignedOut && !user) {
    return <Redirect href="/sign-in" />;
  }

  if (user?.accountStatus === "SUSPENDED") {
    return <Redirect href="/account-status" />;
  }

  if (user && !user.onboardingCompleted && roles?.length) {
    return <Redirect href="/role-selection" />;
  }

  if (user && roles?.length && !roles.includes(user.role)) {
    if (!user.onboardingCompleted) {
      return <Redirect href="/role-selection" />;
    }

    return <Redirect href={getRoleHome(user.role)} />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}

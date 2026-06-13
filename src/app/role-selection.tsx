import { useState } from "react";
import { Pressable, View } from "react-native";
import { Building2, Home } from "lucide-react-native";
import { Link, router } from "expo-router";
import { AppButton } from "@/components/ui/app-button";
import { AppText } from "@/components/ui/app-text";
import { colors } from "@/components/ui/design-system";
import { FinderzLogo } from "@/components/ui/finderz-logo";
import { FormError } from "@/components/ui/form-error";
import { SafeAreaScreen } from "@/components/ui/safe-area-screen";
import { RoleCard } from "@/components/general/role-card";
import { LoadingScreen } from "@/components/shared/loading-screen";
import { getErrorMessage } from "@/lib/get-error-message";
import { useTypedSession } from "@/lib/auth-client";
import { useAssignRole } from "@/services/queries/hooks";
import { useOnboardingStore } from "@/store/onboarding-store";
import type { PublicOnboardingRole } from "@/types/auth";

function getRoleHome(role: string) {
  if (role === "LANDLORD") {
    return "/landlord/dashboard";
  }

  if (role === "SUPER_ADMIN") {
    return "/super-admin/dashboard";
  }

  return "/tenant/dashboard";
}

export default function RoleSelectionScreen() {
  const session = useTypedSession();
  const user = session.data?.user;
  const storedRole = useOnboardingStore((state) => state.selectedRole);
  const setSelectedRole = useOnboardingStore((state) => state.setSelectedRole);
  const setHasSeenPublicOnboarding = useOnboardingStore((state) => state.setHasSeenPublicOnboarding);
  const assignRoleMutation = useAssignRole();
  const [selected, setSelected] = useState<PublicOnboardingRole>(storedRole ?? "TENANT");
  const [error, setError] = useState<string | undefined>();

  if (session.isPending) {
    return <LoadingScreen />;
  }

  if (user?.accountStatus === "SUSPENDED") {
    router.replace("/account-status");
    return <LoadingScreen />;
  }

  if (user?.onboardingCompleted) {
    router.replace(getRoleHome(user.role));
    return <LoadingScreen />;
  }

  const chooseRole = (role: PublicOnboardingRole) => {
    setSelected(role);
    setSelectedRole(role);
    setError(undefined);
  };

  const continueWithRole = async () => {
    setHasSeenPublicOnboarding(true);
    setSelectedRole(selected);
    setError(undefined);

    if (!user) {
      router.push("/sign-up");
      return;
    }

    try {
      const result = await assignRoleMutation.mutateAsync({ role: selected });
      router.replace(getRoleHome(result.user.role));
    } catch (roleError) {
      setError(getErrorMessage(roleError, "Unable to save your role. Please try again."));
    }
  };

  return (
    <SafeAreaScreen scroll>
      <View className="flex-1 px-6 py-5">
        <View className="flex-row items-center justify-between">
          <FinderzLogo variant="text" size="sm" />
          <Link href="/sign-in" asChild>
            <Pressable className="px-3 py-2">
              <AppText style={{ color: colors.primary, fontFamily: "Manrope_700Bold" }}>Sign In</AppText>
            </Pressable>
          </Link>
        </View>

        <View className="mt-12">
          <AppText variant="display">How will you use FinderZ?</AppText>
          <AppText muted className="mt-3">
            Pick the experience that matches your housing goal. You can use FinderZ as a tenant or landlord.
          </AppText>
        </View>

        <View className="mt-10 gap-4">
          <RoleCard
            title="Find a Home"
            subtitle="Search rentals, save favourites, and contact verified landlords."
            selected={selected === "TENANT"}
            icon={<Home color={selected === "TENANT" ? "#fff" : colors.primary} size={30} />}
            onPress={() => chooseRole("TENANT")}
          />
          <RoleCard
            title="List a Property"
            subtitle="Publish listings, manage enquiries, and keep vacancies visible."
            selected={selected === "LANDLORD"}
            icon={<Building2 color={selected === "LANDLORD" ? "#fff" : colors.primary} size={30} />}
            onPress={() => chooseRole("LANDLORD")}
          />
        </View>

        <FormError message={error} />

        <View className="mt-10 gap-4 pb-6">
          <AppButton title="Continue" loading={assignRoleMutation.isPending} onPress={continueWithRole} />
          <View className="flex-row justify-center gap-1">
            <AppText muted>Already have an account?</AppText>
            <Link href="/sign-in" asChild>
              <Pressable>
                <AppText style={{ color: colors.primary, fontFamily: "Manrope_700Bold" }}>Sign In</AppText>
              </Pressable>
            </Link>
          </View>
        </View>
      </View>
    </SafeAreaScreen>
  );
}

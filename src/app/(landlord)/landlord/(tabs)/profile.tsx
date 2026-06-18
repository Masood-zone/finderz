import { router, type Href } from "expo-router";
import { FileCheck2, LogOut, ShieldCheck, UserRound } from "lucide-react-native";
import { Alert, Pressable, ScrollView, View } from "react-native";
import { TenantAvatar } from "@/components/tenant/tenant-shell";
import { AppButton } from "@/components/ui/app-button";
import { AppText } from "@/components/ui/app-text";
import { colors } from "@/components/ui/design-system";
import { LandlordCard, LandlordTopBar, StatusPill } from "@/components/landlord/landlord-shell";
import { signOut } from "@/lib/auth-client";
import { useLandlordProfile } from "@/services/queries/hooks";

export default function LandlordProfileScreen() {
  const profile = useLandlordProfile();
  const user = profile.data?.user;
  const landlord = profile.data?.profile;

  const leave = async () => {
    await signOut();
    router.replace("/sign-in");
  };

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <LandlordTopBar title="Profile" subtitle="Landlord account" userName={user?.name} image={user?.image} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 120, gap: 16 }} showsVerticalScrollIndicator={false}>
        <LandlordCard>
          <View className="items-center">
            <TenantAvatar name={user?.name} image={user?.image} size={92} />
            <AppText variant="headline" className="mt-4">
              {user?.name ?? "Landlord"}
            </AppText>
            <AppText muted>{user?.email}</AppText>
            <View className="mt-3">
              <StatusPill label={landlord?.verificationStatus.replaceAll("_", " ") ?? "NOT SUBMITTED"} tone={landlord?.verificationStatus === "APPROVED" ? "success" : "warning"} />
            </View>
          </View>
        </LandlordCard>

        <LandlordCard>
          <View className="flex-row items-center gap-3">
            <UserRound color={colors.primary} size={22} />
            <View className="min-w-0 flex-1">
              <AppText style={{ fontFamily: "Manrope_700Bold" }}>Landlord Details</AppText>
              <AppText muted>{landlord?.landlordType === "AGENCY" ? landlord.agencyName : landlord?.legalName || "Not submitted"}</AppText>
            </View>
          </View>
        </LandlordCard>

        <LandlordCard>
          <View className="gap-3">
            <AppButton title="Verification Status" variant="secondary" icon={<ShieldCheck color={colors.primary} size={18} />} onPress={() => router.push("/landlord/verification-status" as Href)} />
            <AppButton title={landlord ? "Update Onboarding" : "Start Onboarding"} variant="secondary" icon={<FileCheck2 color={colors.primary} size={18} />} onPress={() => router.push("/landlord/onboarding" as Href)} />
            <AppButton title="Support" variant="ghost" onPress={() => Alert.alert("Support", "FinderZ support tools will be expanded in a later phase.")} />
          </View>
        </LandlordCard>

        <Pressable className="flex-row items-center justify-center gap-3 rounded-2xl p-4" style={{ backgroundColor: colors.errorSoft }} onPress={leave}>
          <LogOut color={colors.error} size={22} />
          <AppText style={{ color: colors.error, fontFamily: "Manrope_700Bold" }}>Sign Out</AppText>
        </Pressable>
      </ScrollView>
    </View>
  );
}

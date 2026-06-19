import { Alert, Pressable, ScrollView, View } from "react-native";
import { router } from "expo-router";
import { Bell, ChevronRight, FileText, Heart, HelpCircle, Lock, LogOut, MessageCircle, Shield, UserRound } from "lucide-react-native";
import { AppText } from "@/components/ui/app-text";
import { colors } from "@/components/ui/design-system";
import { SafeAreaScreen } from "@/components/ui/safe-area-screen";
import { TenantAvatar, TenantTopBar } from "@/components/tenant/tenant-shell";
import { TenantErrorState, TenantSkeleton } from "@/components/tenant/tenant-state";
import { getErrorMessage } from "@/lib/get-error-message";
import { signOut } from "@/lib/auth-client";
import { useTenantProfile } from "@/services/queries/hooks";

type ProfileRowProps = {
  label: string;
  icon: React.ComponentType<{ color: string; size: number }>;
  count?: number;
  onPress?: () => void;
};

function ProfileRow({ label, icon: Icon, count, onPress }: ProfileRowProps) {
  return (
    <Pressable className="flex-row items-center justify-between p-4" onPress={onPress}>
      <View className="flex-row items-center gap-3">
        <Icon color={colors.primary} size={21} />
        <AppText>{label}</AppText>
      </View>
      <View className="flex-row items-center gap-2">
        {count ? (
          <View className="rounded-full px-2 py-1" style={{ backgroundColor: colors.primary }}>
            <AppText variant="caption" style={{ color: "#fff", fontFamily: "Manrope_700Bold" }}>
              {count}
            </AppText>
          </View>
        ) : null}
        <ChevronRight color={colors.outline} size={18} />
      </View>
    </Pressable>
  );
}

function ProfileSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View>
      <AppText variant="label" muted className="mb-2 ml-1">
        {title}
      </AppText>
      <View className="overflow-hidden rounded-2xl" style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}>
        {children}
      </View>
    </View>
  );
}

export default function TenantProfileScreen() {
  const profile = useTenantProfile();

  const leave = async () => {
    await signOut();
    router.replace("/sign-in");
  };

  if (profile.isLoading) {
    return <TenantSkeleton rows={4} />;
  }

  if (profile.isError || !profile.data) {
    return <TenantErrorState message={getErrorMessage(profile.error, "Unable to load profile.")} onRetry={() => void profile.refetch()} />;
  }

  const user = profile.data.user;

  return (
    <SafeAreaScreen edges={["right", "bottom", "left"]}>
      <TenantTopBar userName={user.name} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 120, gap: 22 }} showsVerticalScrollIndicator={false}>
        <View className="items-center rounded-2xl p-5" style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}>
          <TenantAvatar name={user.name} image={user.image} size={96} />
          <AppText variant="headline" className="mt-4">
            {user.name}
          </AppText>
          <AppText muted>{user.email}</AppText>
          <View className="mt-3 rounded-full px-3 py-1" style={{ backgroundColor: colors.gold }}>
            <AppText variant="caption" style={{ color: colors.goldDark, fontFamily: "Manrope_700Bold" }}>
              {user.emailVerified ? "Verified User" : "Email Verification Pending"}
            </AppText>
          </View>
        </View>

        <ProfileSection title="Personal">
          <ProfileRow label="Edit Profile" icon={UserRound} onPress={() => Alert.alert("Edit Profile", "Profile editing will be expanded in a later account settings slice.")} />
          <ProfileRow label="Privacy & Security" icon={Lock} />
        </ProfileSection>

        <ProfileSection title="Activity">
          <ProfileRow label="My Enquiries" icon={MessageCircle} count={profile.data.stats.enquiries} onPress={() => router.push("/tenant/enquiries")} />
          <ProfileRow label="Saved Properties" icon={Heart} count={profile.data.stats.savedProperties} onPress={() => router.push("/tenant/favourites")} />
        </ProfileSection>

        <ProfileSection title="Preferences">
          <ProfileRow label="Notifications" icon={Bell} count={profile.data.stats.unreadMessages} />
          <ProfileRow label="Privacy and Security" icon={Shield} />
        </ProfileSection>

        <ProfileSection title="Support">
          <ProfileRow label="Support" icon={HelpCircle} />
          <ProfileRow label="Policies" icon={FileText} />
        </ProfileSection>

        <Pressable className="flex-row items-center justify-center gap-3 rounded-2xl p-4" style={{ backgroundColor: colors.errorSoft }} onPress={leave}>
          <LogOut color={colors.error} size={22} />
          <AppText style={{ color: colors.error, fontFamily: "Manrope_700Bold" }}>Sign Out</AppText>
        </Pressable>
      </ScrollView>
    </SafeAreaScreen>
  );
}

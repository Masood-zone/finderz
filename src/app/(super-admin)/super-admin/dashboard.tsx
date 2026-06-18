import { AppButton } from "@/components/ui/app-button";
import { AppText } from "@/components/ui/app-text";
import { colors } from "@/components/ui/design-system";
import { SafeAreaScreen } from "@/components/ui/safe-area-screen";
import { signOut } from "@/lib/auth-client";
import { useSuperAdminDashboard } from "@/services/queries/hooks";
import { router } from "expo-router";
import { View } from "react-native";

export default function SuperAdminDashboardScreen() {
  const dashboard = useSuperAdminDashboard();
  const logOut = async () => {
    await signOut();
    router.replace("/sign-in");
  };
  return (
    <SafeAreaScreen scroll contentContainerStyle={{ padding: 24, justifyContent: "center" }}>
      <AppText variant="headline">
        Super Administrator dashboard
      </AppText>
      <AppText className="mt-2" muted>
        Status: {dashboard.status}
      </AppText>

      {/* Profile data */}
      <View className="mt-4 rounded-2xl border p-4" style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
        <AppText variant="title">
          Profile Information
        </AppText>
        <AppText className="mt-2" muted>
          Name: {dashboard?.data?.user?.name}
        </AppText>
        <AppText muted>
          Email: {dashboard?.data?.user?.email}
        </AppText>

        <AppButton
          title="Log out"
          variant="danger"
          onPress={() => {
            logOut();
          }}
          style={{ marginTop: 16 }}
        />
      </View>
    </SafeAreaScreen>
  );
}

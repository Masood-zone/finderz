import { AppButton } from "@/components/ui/app-button";
import { signOut } from "@/lib/auth-client";
import { useSuperAdminDashboard } from "@/services/queries/hooks";
import { router } from "expo-router";
import { Text, View } from "react-native";

export default function SuperAdminDashboardScreen() {
  const dashboard = useSuperAdminDashboard();
  const logOut = async () => {
    await signOut();
    router.replace("/sign-in");
  };
  return (
    <View className="flex-1 justify-center bg-background px-6">
      <Text className="text-2xl font-bold text-text-primary">
        Super Administrator dashboard
      </Text>
      <Text className="mt-2 text-base text-text-secondary">
        Status: {dashboard.status}
      </Text>

      {/* Profile data */}
      <View className="mt-4">
        <Text className="text-lg font-semibold text-text-primary">
          Profile Information
        </Text>
        <Text className="mt-2 text-base text-text-secondary">
          Name: {dashboard?.data?.user?.name}
        </Text>
        <Text className="text-base text-text-secondary">
          Email: {dashboard?.data?.user?.email}
        </Text>

        <AppButton
          title="Log out"
          variant="danger"
          onPress={() => {
            logOut();
          }}
          className="mt-4"
        />
      </View>
    </View>
  );
}

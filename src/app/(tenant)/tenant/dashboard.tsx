import { Text, View } from "react-native";
import { useTenantDashboard } from "@/services/queries/hooks";

export default function TenantDashboardScreen() {
  const dashboard = useTenantDashboard();

  return (
    <View className="flex-1 justify-center bg-background px-6">
      <Text className="text-2xl font-bold text-text-primary">Tenant dashboard</Text>
      <Text className="mt-2 text-base text-text-secondary">Status: {dashboard.status}</Text>
    </View>
  );
}

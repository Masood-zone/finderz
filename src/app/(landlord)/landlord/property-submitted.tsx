import { router, type Href } from "expo-router";
import { CheckCircle2 } from "lucide-react-native";
import { View } from "react-native";
import { StateView } from "@/components/general/state-view";
import { colors } from "@/components/ui/design-system";

export default function PropertySubmittedScreen() {
  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <StateView
        icon={<CheckCircle2 color={colors.success} size={42} />}
        title="Property submitted successfully"
        message="Your listing is pending administrator approval. It will not be visible to tenants until approved."
        primaryAction={{ title: "View My Properties", onPress: () => router.replace("/landlord/properties" as Href) }}
        secondaryAction={{ title: "Add Another Property", onPress: () => router.replace("/landlord/properties/create/basics" as Href), variant: "secondary" }}
      />
    </View>
  );
}

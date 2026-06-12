import { Text, View } from "react-native";

export default function RoleSelectionScreen() {
  return (
    <View className="flex-1 justify-center bg-background px-6">
      <Text className="text-2xl font-bold text-text-primary">Choose your FinderZ role</Text>
      <Text className="mt-2 text-base text-text-secondary">
        The screen can store a temporary TENANT or LANDLORD choice locally; the API makes the final role decision.
      </Text>
    </View>
  );
}

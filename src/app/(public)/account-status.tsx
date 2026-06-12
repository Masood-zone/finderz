import { Text, View } from "react-native";

export default function AccountStatusScreen() {
  return (
    <View className="flex-1 justify-center bg-background px-6">
      <Text className="text-2xl font-bold text-error">Account unavailable</Text>
      <Text className="mt-2 text-base text-text-secondary">This account cannot access FinderZ right now.</Text>
    </View>
  );
}

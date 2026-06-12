import { Link } from "expo-router";
import { Text, View } from "react-native";

export default function PublicOnboardingScreen() {
  return (
    <View className="flex-1 justify-center bg-background px-6">
      <Text className="text-3xl font-bold text-text-primary">Find a home in Ghana</Text>
      <Text className="mt-3 text-base leading-6 text-text-secondary">
        Browse verified rentals, contact landlords, and manage your housing journey with FinderZ.
      </Text>
      <Link href="/sign-in" className="mt-8 rounded-lg bg-primary px-5 py-3 text-center font-semibold text-white">
        Continue
      </Link>
    </View>
  );
}

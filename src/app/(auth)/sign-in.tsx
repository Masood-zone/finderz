import { Link } from "expo-router";
import { Text, View } from "react-native";

export default function SignInScreen() {
  return (
    <View className="flex-1 justify-center bg-background px-6">
      <Text className="text-2xl font-bold text-text-primary">Sign in</Text>
      <Text className="mt-2 text-base text-text-secondary">Phase 2 auth helpers are ready for the sign-in form.</Text>
      <Link href="/role-selection" className="mt-8 text-primary">
        Role selection
      </Link>
    </View>
  );
}

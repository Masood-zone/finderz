import { Image, Text, View } from "react-native";
import { NativeWindSmokeTest } from "@/components/ui/nativewind-smoke-test";

export default function Index() {
  return (
    <View className="flex-1 bg-background px-6 pb-8 pt-16">
      <View className="flex-1 justify-center">
        <Image
          source={require("../../assets/images/logo-glow.png")}
          className="mb-8 h-24 w-24 self-center"
          resizeMode="contain"
        />
        <Text className="text-center text-3xl font-bold text-text-primary">FinderZ</Text>
        <Text className="mt-3 text-center text-base leading-6 text-text-secondary">
          Ghanaian housing search foundations are ready for tenants, landlords, and administrators.
        </Text>
      </View>
      <NativeWindSmokeTest />
    </View>
  );
}

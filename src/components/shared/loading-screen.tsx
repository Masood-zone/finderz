import { Image, Text, View } from "react-native";

export function LoadingScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-background px-6">
      <Image source={require("../../../assets/images/logo-glow.png")} className="h-20 w-20" resizeMode="contain" />
      <Text className="mt-4 text-base font-semibold text-text-primary">FinderZ</Text>
    </View>
  );
}

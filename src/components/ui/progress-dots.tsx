import { View } from "react-native";
import { colors } from "./design-system";

export function ProgressDots({ total, index }: { total: number; index: number }) {
  return (
    <View className="flex-row items-center justify-center gap-2">
      {Array.from({ length: total }).map((_, itemIndex) => (
        <View
          key={itemIndex}
          style={{
            width: itemIndex === index ? 32 : 8,
            height: 8,
            borderRadius: 999,
            backgroundColor: itemIndex === index ? colors.gold : colors.border,
          }}
        />
      ))}
    </View>
  );
}

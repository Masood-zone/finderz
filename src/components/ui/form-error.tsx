import { CircleAlert, Info } from "lucide-react-native";
import { View } from "react-native";
import { AppText } from "./app-text";
import { colors, radius } from "./design-system";

type FormErrorProps = {
  message?: string;
  title?: string;
  tone?: "error" | "info";
};

export function FormError({ message, title, tone = "error" }: FormErrorProps) {
  if (!message) {
    return null;
  }

  const isError = tone === "error";
  const Icon = isError ? CircleAlert : Info;
  const accent = isError ? colors.error : colors.primary;
  const backgroundColor = isError ? colors.errorSoft : colors.surfaceBlue;

  return (
    <View
      className="mt-1 flex-row gap-3 px-4 py-3"
      style={{
        backgroundColor,
        borderColor: accent,
        borderRadius: radius.lg,
        borderWidth: 1,
      }}
    >
      <Icon color={accent} size={18} />
      <View className="min-w-0 flex-1">
        {title ? (
          <AppText variant="caption" style={{ color: accent, fontFamily: "Manrope_700Bold" }}>
            {title}
          </AppText>
        ) : null}
        <AppText variant="caption" style={{ color: isError ? colors.errorText : colors.primary }}>
          {message}
        </AppText>
      </View>
    </View>
  );
}

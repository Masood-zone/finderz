import { forwardRef } from "react";
import type { ReactNode } from "react";
import { TextInput, type TextInputProps, View } from "react-native";
import { AppText } from "./app-text";
import { colors, radius } from "./design-system";
import { FormError } from "./form-error";

type AppInputProps = TextInputProps & {
  label: string;
  error?: string;
  left?: ReactNode;
  right?: ReactNode;
};

export const AppInput = forwardRef<TextInput, AppInputProps>(({ label, error, left, right, style, ...props }, ref) => {
  return (
    <View>
      <AppText variant="label" muted className="mb-2 ml-1">
        {label}
      </AppText>
      <View
        className="h-12 flex-row items-center px-4"
        style={{
          borderRadius: radius.lg,
          borderWidth: 1.5,
          borderColor: error ? colors.error : colors.border,
          backgroundColor: colors.surface,
        }}
      >
        {left}
        <TextInput
          ref={ref}
          placeholderTextColor="#98a2b3"
          className="min-w-0 flex-1 text-base"
          style={[{ color: colors.text, fontFamily: "Manrope_400Regular" }, style]}
          {...props}
        />
        {right}
      </View>
      <FormError message={error} />
    </View>
  );
});

AppInput.displayName = "AppInput";

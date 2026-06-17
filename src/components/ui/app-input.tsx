import { forwardRef, useState } from "react";
import type { ReactNode } from "react";
import { TextInput, type TextInputProps, View } from "react-native";
import { AppText } from "./app-text";
import { colors, radius, shadows } from "./design-system";
import { FormError } from "./form-error";

type AppInputProps = TextInputProps & {
  label: string;
  error?: string;
  left?: ReactNode;
  right?: ReactNode;
};

export const AppInput = forwardRef<TextInput, AppInputProps>(({ label, error, left, right, style, onBlur, onFocus, ...props }, ref) => {
  const [focused, setFocused] = useState(false);
  const borderColor = error ? colors.error : focused ? colors.primary : colors.border;

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
          borderColor,
          backgroundColor: colors.surface,
          ...(focused ? shadows.sm : {}),
        }}
      >
        {left}
        <TextInput
          ref={ref}
          placeholderTextColor="#98a2b3"
          className="min-w-0 flex-1 text-base"
          style={[{ color: colors.text, fontFamily: "Manrope_400Regular" }, style]}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          {...props}
        />
        {right}
      </View>
      <FormError message={error} />
    </View>
  );
});

AppInput.displayName = "AppInput";

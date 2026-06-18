import { forwardRef, useState } from "react";
import type { ReactNode } from "react";
import {
  StyleSheet,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";
import { AppText } from "./app-text";
import { colors, radius } from "./design-system";
import { FormError } from "./form-error";

type AppInputProps = TextInputProps & {
  label: string;
  error?: string;
  left?: ReactNode;
  right?: ReactNode;
};

export const AppInput = forwardRef<TextInput, AppInputProps>(
  (
    {
      label,
      error,
      left,
      right,
      multiline,
      style,
      onBlur,
      onFocus,
      ...props
    },
    ref,
  ) => {
    const [focused, setFocused] = useState(false);
    const borderColor = error
      ? colors.error
      : focused
        ? colors.primary
        : colors.border;

    return (
      <View>
        <AppText variant="label" muted className="mb-2 ml-1">
          {label}
        </AppText>

        <View
          style={[
            styles.container,
            {
              borderColor,
              backgroundColor: colors.surface,
              height: multiline ? undefined : 48,
              minHeight: multiline ? 120 : 48,
              alignItems: multiline ? "flex-start" : "center",
            },
          ]}
        >
          {left ? (
            <View pointerEvents="none" style={styles.leftAccessory}>
              {left}
            </View>
          ) : null}

          <TextInput
            {...props}
            multiline={multiline}
            ref={ref}
            placeholderTextColor="#98a2b3"
            selectionColor={colors.primary}
            cursorColor={colors.primary}
            underlineColorAndroid="transparent"
            style={[
              styles.input,
              {
                color: colors.text,
                fontFamily: "Manrope_400Regular",
                height: multiline ? undefined : "100%",
                minHeight: multiline ? 96 : undefined,
              },
              style,
            ]}
            onBlur={(event) => {
              setFocused(false);
              onBlur?.(event);
            }}
            onFocus={(event) => {
              setFocused(true);
              onFocus?.(event);
            }}
          />

          {right ? <View style={styles.rightAccessory}>{right}</View> : null}
        </View>

        <FormError message={error} />
      </View>
    );
  },
);

AppInput.displayName = "AppInput";

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: radius.lg,
    borderWidth: 1.5,
    paddingHorizontal: 16,
  },
  input: {
    minWidth: 0,
    flex: 1,
    height: "100%",
    paddingHorizontal: 0,
    paddingVertical: 0,
    fontSize: 16,
    lineHeight: 22,
    includeFontPadding: false,
    textAlignVertical: "center",
  },
  leftAccessory: {
    marginRight: 10,
  },
  rightAccessory: {
    marginLeft: 10,
  },
});

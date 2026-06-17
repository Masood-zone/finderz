import { Eye, EyeOff } from "lucide-react-native";
import { useRef, useState } from "react";
import {
  Pressable,
  TextInput,
} from "react-native";
import type { ComponentProps } from "react";
import { AppInput } from "./app-input";
import { colors } from "./design-system";

export function PasswordInput(props: ComponentProps<typeof AppInput>) {
  const [visible, setVisible] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const toggleVisibility = () => {
    setVisible((current) => !current);

    // Tapping the eye icon can blur a TextInput on Android.
    // Restore focus after the secureTextEntry state changes.
    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  };

  return (
    <AppInput
      {...props}
      ref={inputRef}
      secureTextEntry={!visible}
      right={
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={visible ? "Hide password" : "Show password"}
          focusable={false}
          hitSlop={10}
          onPress={toggleVisibility}
        >
          {visible ? (
            <EyeOff color={colors.outline} size={20} />
          ) : (
            <Eye color={colors.outline} size={20} />
          )}
        </Pressable>
      }
    />
  );
}

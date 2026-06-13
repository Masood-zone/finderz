import { Eye, EyeOff } from "lucide-react-native";
import { useState } from "react";
import { Pressable } from "react-native";
import { AppInput } from "./app-input";
import { colors } from "./design-system";
import type { ComponentProps } from "react";

export function PasswordInput(props: ComponentProps<typeof AppInput>) {
  const [visible, setVisible] = useState(false);

  return (
    <AppInput
      secureTextEntry={!visible}
      right={
        <Pressable accessibilityRole="button" accessibilityLabel={visible ? "Hide password" : "Show password"} onPress={() => setVisible((value) => !value)}>
          {visible ? <EyeOff color={colors.outline} size={20} /> : <Eye color={colors.outline} size={20} />}
        </Pressable>
      }
      {...props}
    />
  );
}

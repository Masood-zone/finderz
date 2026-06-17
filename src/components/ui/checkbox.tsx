import { Check } from "lucide-react-native";
import type { ReactNode } from "react";
import { Pressable, View } from "react-native";
import { colors, radius } from "./design-system";

type CheckboxProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: ReactNode;
};

export function Checkbox({ checked, onChange, label }: CheckboxProps) {
  return (
    <Pressable accessibilityRole="checkbox" accessibilityState={{ checked }} className="flex-row items-start gap-3" onPress={() => onChange(!checked)}>
      <View
        className="h-6 w-6 items-center justify-center"
        style={{
          borderRadius: radius.md,
          borderWidth: 1.5,
          borderColor: checked ? colors.primary : colors.borderStrong,
          backgroundColor: checked ? colors.primary : colors.surface,
        }}
      >
        {checked ? <Check color="#fff" size={16} /> : null}
      </View>
      {label}
    </Pressable>
  );
}

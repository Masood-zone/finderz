import type { ReactNode } from "react";
import { ScrollView, View, type ScrollViewProps, type StyleProp, type ViewProps, type ViewStyle } from "react-native";
import { type Edge, useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "./design-system";

type SafeAreaScreenProps = ViewProps & {
  scroll?: boolean;
  children: ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
  edges?: Edge[];
  scrollViewProps?: Omit<ScrollViewProps, "children" | "contentContainerStyle">;
};

export function SafeAreaScreen({
  scroll,
  children,
  className = "",
  contentContainerStyle,
  edges = ["top", "right", "bottom", "left"],
  scrollViewProps,
  style,
  ...props
}: SafeAreaScreenProps) {
  const insets = useSafeAreaInsets();
  const safeAreaStyle = {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: edges.includes("top") ? insets.top : 0,
    paddingRight: edges.includes("right") ? insets.right : 0,
    paddingBottom: edges.includes("bottom") ? insets.bottom : 0,
    paddingLeft: edges.includes("left") ? insets.left : 0,
  };

  if (scroll) {
    return (
      <View
        className={`flex-1 ${className}`}
        style={[safeAreaStyle, style]}
        {...props}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[{ flexGrow: 1 }, contentContainerStyle]}
          showsVerticalScrollIndicator={false}
          style={{ flex: 1 }}
          {...scrollViewProps}
        >
          {children}
        </ScrollView>
      </View>
    );
  }

  return (
    <View
      className={`flex-1 ${className}`}
      style={[safeAreaStyle, style]}
      {...props}
    >
      {children}
    </View>
  );
}

import { View } from "react-native";
import { AccountEditorForm } from "@/components/profile/account-editor-form";
import { KeyboardAwareScreen } from "@/components/ui/keyboard-aware-screen";
import { ScreenShell } from "@/components/ui/screen-shell";

export default function TenantEditProfileScreen() {
  return (
    <KeyboardAwareScreen bottomOffset={96}>
      <ScreenShell title="Edit Profile" subtitle="Manage your FinderZ account details." showBack>
        <View className="mt-6">
          <AccountEditorForm fallbackHref="/tenant/profile" />
        </View>
      </ScreenShell>
    </KeyboardAwareScreen>
  );
}

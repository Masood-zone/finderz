import { View } from "react-native";
import { AccountEditorForm } from "@/components/profile/account-editor-form";
import { KeyboardAwareScreen } from "@/components/ui/keyboard-aware-screen";
import { ScreenShell } from "@/components/ui/screen-shell";

export default function LandlordEditProfileScreen() {
  return (
    <KeyboardAwareScreen bottomOffset={96}>
      <ScreenShell title="Edit Profile" subtitle="Update your account photo, contact details, and password." showBack>
        <View className="mt-6">
          <AccountEditorForm fallbackHref="/landlord/profile" />
        </View>
      </ScreenShell>
    </KeyboardAwareScreen>
  );
}

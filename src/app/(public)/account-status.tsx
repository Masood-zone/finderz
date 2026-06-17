import { StateView } from "@/components/general/state-view";
import { colors } from "@/components/ui/design-system";
import { SafeAreaScreen } from "@/components/ui/safe-area-screen";
import { signOut } from "@/lib/auth-client";
import { router } from "expo-router";
import { ShieldAlert } from "lucide-react-native";

export default function AccountStatusScreen() {
  const leaveAccount = async () => {
    await signOut();
    router.replace("/sign-in");
  };

  return (
    <SafeAreaScreen>
      <StateView
        icon={<ShieldAlert color={colors.error} size={54} />}
        title="Account Under Review"
        message="Your FinderZ account cannot access dashboards right now. Contact support if you believe this is a mistake."
        primaryAction={{
          title: "Back to Sign In",
          onPress: leaveAccount,
          variant: "danger",
        }}
        secondaryAction={{
          title: "Go Home",
          onPress: () => router.replace("/"),
          variant: "secondary",
        }}
      />
    </SafeAreaScreen>
  );
}

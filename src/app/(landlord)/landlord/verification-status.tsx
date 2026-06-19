import { router, type Href } from "expo-router";
import { CheckCircle2, Clock3, FileWarning, ShieldQuestion, XCircle } from "lucide-react-native";
import { View } from "react-native";
import { AppText } from "@/components/ui/app-text";
import { colors } from "@/components/ui/design-system";
import { StateView } from "@/components/general/state-view";
import { useLandlordVerificationStatus } from "@/services/queries/hooks";

export default function VerificationStatusScreen() {
  const verification = useLandlordVerificationStatus();
  const status = verification.data?.status ?? "NOT_SUBMITTED";

  const icon =
    status === "APPROVED" ? (
      <CheckCircle2 color={colors.success} size={38} />
    ) : status === "REJECTED" ? (
      <XCircle color={colors.error} size={38} />
    ) : status === "PENDING" ? (
      <Clock3 color={colors.warning} size={38} />
    ) : status === "CHANGES_REQUESTED" ? (
      <FileWarning color={colors.warning} size={38} />
    ) : (
      <ShieldQuestion color={colors.primary} size={38} />
    );

  const title =
    status === "APPROVED"
      ? "Verification approved"
      : status === "PENDING"
        ? "Verification pending"
        : status === "REJECTED"
          ? "Verification rejected"
          : status === "CHANGES_REQUESTED"
            ? "Changes requested"
            : "Verification not submitted";

  const primary =
    status === "APPROVED"
      ? { title: "Go to Dashboard", onPress: () => router.replace("/landlord" as Href) }
      : { title: status === "NOT_SUBMITTED" ? "Start Onboarding" : "Update Details", onPress: () => router.push("/landlord/onboarding" as Href) };

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <StateView icon={icon} title={title} message={verification.data?.nextAction ?? "Submit your landlord details to continue."} primaryAction={primary} secondaryAction={{ title: "Continue to Dashboard", onPress: () => router.replace("/landlord" as Href), variant: "secondary" }}>
        {verification.data?.notes ? (
          <View className="rounded-2xl border p-4" style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
            <AppText variant="label" muted>
              Review Notes
            </AppText>
            <AppText className="mt-2">{verification.data.notes}</AppText>
          </View>
        ) : null}
      </StateView>
    </View>
  );
}

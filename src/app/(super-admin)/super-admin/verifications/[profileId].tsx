import { useLocalSearchParams } from "expo-router";
import { AlertCircle, ExternalLink, FileCheck2, Mail, Phone, UserRound } from "lucide-react-native";
import { useState } from "react";
import { ActivityIndicator, Linking, StyleSheet, View } from "react-native";
import { AdminCard, StatusPill, SuperAdminShell } from "@/components/super-admin/super-admin-shell";
import { AppButton } from "@/components/ui/app-button";
import { AppInput } from "@/components/ui/app-input";
import { AppText } from "@/components/ui/app-text";
import { colors } from "@/components/ui/design-system";
import { getErrorMessage } from "@/lib/get-error-message";
import { useSuperAdminLandlordVerification, useSuperAdminLandlordVerificationAction } from "@/services/queries/hooks";
import type { LandlordVerificationStatus } from "@/types/landlord";
import type { LandlordVerificationAction } from "@/types/super-admin";

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function toneFor(status: LandlordVerificationStatus) {
  if (status === "APPROVED") return "success";
  if (status === "REJECTED") return "danger";
  if (status === "PENDING" || status === "CHANGES_REQUESTED") return "warning";
  return "neutral";
}

export default function VendorVerificationDetailScreen() {
  const params = useLocalSearchParams<{ profileId?: string | string[] }>();
  const profileId = firstParam(params.profileId) ?? "";
  const verification = useSuperAdminLandlordVerification(profileId);
  const action = useSuperAdminLandlordVerificationAction();
  const [reason, setReason] = useState("");
  const [pendingAction, setPendingAction] = useState<LandlordVerificationAction | null>(null);
  const item = verification.data?.verification;

  const submit = async (nextAction: LandlordVerificationAction) => {
    setPendingAction(nextAction);
    try {
      await action.mutateAsync({ profileId, action: nextAction, reason });
      if (nextAction === "approve") {
        setReason("");
      }
    } finally {
      setPendingAction(null);
    }
  };

  const openDocument = async () => {
    if (!item?.identityDocumentUrl) return;

    try {
      await Linking.openURL(item.identityDocumentUrl);
    } catch {
      // Keep the user in place if the platform cannot open the file.
    }
  };

  return (
    <SuperAdminShell title="Vendor Verification" subtitle="Inspect submitted identity details and decide whether this landlord can be verified.">
      {verification.isLoading ? <ActivityIndicator color={colors.primary} /> : null}
      {verification.isError ? (
        <AdminCard>
          <AppText variant="title" style={{ color: colors.error }}>
            Unable to load verification
          </AppText>
          <AppText muted style={{ marginTop: 6 }}>
            {getErrorMessage(verification.error, "This vendor review could not be loaded.")}
          </AppText>
          <View style={{ marginTop: 12 }}>
            <AppButton title="Try Again" variant="secondary" onPress={() => void verification.refetch()} />
          </View>
        </AdminCard>
      ) : null}

      {!verification.isLoading && !verification.isError && !item ? (
        <AdminCard>
          <AppText variant="title">Verification unavailable</AppText>
          <AppText muted style={{ marginTop: 6 }}>
            This landlord profile could not be found.
          </AppText>
        </AdminCard>
      ) : null}

      {item ? (
        <>
          <AdminCard>
            <View style={styles.between}>
              <View style={{ flex: 1 }}>
                <AppText variant="headline" style={{ color: colors.primary }}>
                  {item.legalName ?? item.user?.name ?? "Unnamed vendor"}
                </AppText>
                <AppText muted>{item.agencyName ? `${item.agencyName} - ${item.landlordType}` : item.landlordType}</AppText>
              </View>
              <StatusPill label={item.verificationStatus.replaceAll("_", " ")} tone={toneFor(item.verificationStatus)} />
            </View>
            {item.verificationNotes ? (
              <View style={styles.note}>
                <AlertCircle color={colors.warning} size={18} />
                <AppText style={{ flex: 1, color: colors.warning }}>{item.verificationNotes}</AppText>
              </View>
            ) : null}
          </AdminCard>

          <AdminCard>
            <AppText variant="title">Submitted Details</AppText>
            <View style={styles.detailStack}>
              <View style={styles.detailRow}>
                <UserRound color={colors.primary} size={18} />
                <View style={{ flex: 1 }}>
                  <AppText>{item.user?.name ?? item.legalName}</AppText>
                  <AppText muted>{item.address ?? "No address supplied"}</AppText>
                </View>
              </View>
              <View style={styles.detailRow}>
                <Mail color={colors.primary} size={18} />
                <AppText>{item.user?.email ?? "No email"}</AppText>
              </View>
              <View style={styles.detailRow}>
                <Phone color={colors.primary} size={18} />
                <AppText>{item.user?.phone ?? "No phone"}</AppText>
              </View>
              <View style={styles.detailRow}>
                <FileCheck2 color={colors.primary} size={18} />
                <View style={{ flex: 1 }}>
                  <AppText>{item.identityDocumentType ?? "Identity document"}</AppText>
                  <AppText muted>{item.identityDocumentUrl ? "Document uploaded" : "No document URL found"}</AppText>
                </View>
              </View>
            </View>
            <View style={{ marginTop: 12 }}>
              <AppButton title="Open Document" variant="secondary" icon={<ExternalLink color={colors.primary} size={18} />} disabled={!item.identityDocumentUrl} onPress={() => void openDocument()} />
            </View>
          </AdminCard>

          <AdminCard>
            <AppText variant="title">Review Decision</AppText>
            <AppInput label="Reason for changes or rejection" value={reason} onChangeText={setReason} multiline placeholder="Tell the vendor exactly what to fix before resubmitting." />
            <View style={styles.actions}>
              <AppButton title="Verify Vendor" loading={pendingAction === "approve"} disabled={Boolean(pendingAction) && pendingAction !== "approve"} onPress={() => void submit("approve")} />
              <AppButton title="Request Changes" variant="secondary" loading={pendingAction === "request_changes"} disabled={Boolean(pendingAction) && pendingAction !== "request_changes"} onPress={() => void submit("request_changes")} />
              <AppButton title="Reject" variant="danger" loading={pendingAction === "reject"} disabled={Boolean(pendingAction) && pendingAction !== "reject"} onPress={() => void submit("reject")} />
            </View>
          </AdminCard>

          <AdminCard>
            <AppText variant="title">Review History</AppText>
            <View style={styles.historyStack}>
              {item.reviewHistory.map((history) => (
                <View key={history.id} style={styles.historyRow}>
                  <View style={styles.dot} />
                  <View style={{ flex: 1 }}>
                    <AppText>{history.action.replaceAll("_", " ")}</AppText>
                    <AppText muted>{new Date(history.createdAt).toLocaleString()}</AppText>
                  </View>
                </View>
              ))}
              {!item.reviewHistory.length ? <AppText muted>No admin review actions recorded yet.</AppText> : null}
            </View>
          </AdminCard>
        </>
      ) : null}
    </SuperAdminShell>
  );
}

const styles = StyleSheet.create({
  between: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
  },
  note: {
    backgroundColor: colors.warningSoft,
    borderRadius: 12,
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
    padding: 12,
  },
  detailStack: {
    gap: 12,
    marginTop: 12,
  },
  detailRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
  },
  actions: {
    gap: 10,
    marginTop: 12,
  },
  historyStack: {
    gap: 10,
    marginTop: 12,
  },
  historyRow: {
    flexDirection: "row",
    gap: 10,
  },
  dot: {
    backgroundColor: colors.primary,
    borderRadius: 6,
    height: 12,
    marginTop: 6,
    width: 12,
  },
});

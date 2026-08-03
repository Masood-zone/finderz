import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { router, type Href } from "expo-router";
import { AlertTriangle, Building2, UserRound } from "lucide-react-native";
import {
  AdminCard,
  StatusPill,
  SuperAdminShell,
} from "@/components/super-admin/super-admin-shell";
import { AppButton } from "@/components/ui/app-button";
import { AppInput } from "@/components/ui/app-input";
import { AppText } from "@/components/ui/app-text";
import { colors } from "@/components/ui/design-system";
import { FormError } from "@/components/ui/form-error";
import { getErrorMessage } from "@/lib/get-error-message";
import {
  useSuperAdminReportAction,
  useSuperAdminReports,
} from "@/services/queries/hooks";
import type {
  ReportModerationAction,
  SuperAdminReport,
} from "@/types/super-admin";

const filters = ["all", "open", "reviewing", "resolved", "dismissed"] as const;

function statusTone(status: SuperAdminReport["status"]) {
  if (status === "OPEN") return "danger" as const;
  if (status === "REVIEWING") return "warning" as const;
  if (status === "RESOLVED") return "success" as const;
  return "neutral" as const;
}

export default function ReportedListingsScreen() {
  const [status, setStatus] = useState<(typeof filters)[number]>("all");
  const [reasons, setReasons] = useState<Record<string, string>>({});
  const [error, setError] = useState<string>();
  const reports = useSuperAdminReports({ pageSize: 30, status });
  const action = useSuperAdminReportAction();

  const runAction = async (
    report: SuperAdminReport,
    moderationAction: ReportModerationAction,
  ) => {
    const reason = reasons[report.id]?.trim();
    const requiresReason =
      moderationAction === "suspend_listing" ||
      moderationAction === "suspend_owner";

    if (requiresReason && !reason) {
      setError("Enter a moderation reason before suspending a listing or owner.");
      return;
    }

    setError(undefined);
    try {
      await action.mutateAsync({
        reportId: report.id,
        action: moderationAction,
        reason: reason || undefined,
      });
      setReasons((current) => ({ ...current, [report.id]: "" }));
      Alert.alert("Report updated", "The moderation action was completed.");
    } catch (actionError) {
      setError(getErrorMessage(actionError, "Unable to update this report."));
    }
  };

  const confirmAction = (
    report: SuperAdminReport,
    moderationAction: "suspend_listing" | "suspend_owner",
  ) => {
    const ownerListings = report.owner?.listingCount ?? 0;
    Alert.alert(
      moderationAction === "suspend_owner"
        ? "Suspend property owner?"
        : "Suspend this listing?",
      moderationAction === "suspend_owner"
        ? `This will block ${report.owner?.name ?? "the owner"} and hide all ${ownerListings} of their listings. Reactivation will not republish them.`
        : "This listing will immediately disappear from tenant search and direct access.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Suspend",
          style: "destructive",
          onPress: () => void runAction(report, moderationAction),
        },
      ],
    );
  };

  return (
    <SuperAdminShell
      title="Reported Listings"
      subtitle="Investigate tenant reports and protect the marketplace."
    >
      <View style={styles.filters}>
        {filters.map((filter) => {
          const selected = filter === status;
          return (
            <Pressable
              key={filter}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => setStatus(filter)}
              style={[styles.filter, selected && styles.filterSelected]}
            >
              <AppText
                variant="label"
                style={{ color: selected ? colors.primary : colors.muted }}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </AppText>
            </Pressable>
          );
        })}
      </View>

      <FormError title="Moderation failed" message={error} />
      {reports.isLoading ? <ActivityIndicator color={colors.primary} /> : null}
      {reports.isError ? (
        <AdminCard>
          <FormError
            title="Reports unavailable"
            message={getErrorMessage(reports.error, "Unable to load reports.")}
          />
          <AppButton
            title="Try Again"
            variant="secondary"
            onPress={() => void reports.refetch()}
          />
        </AdminCard>
      ) : null}

      <View style={styles.stack}>
        {(reports.data?.items ?? []).map((report) => {
          const closed =
            report.status === "RESOLVED" || report.status === "DISMISSED";
          const loading =
            action.isPending && action.variables?.reportId === report.id;

          return (
            <AdminCard key={report.id}>
              <View style={styles.header}>
                <AlertTriangle size={22} color={colors.error} />
                <View style={styles.grow}>
                  <AppText variant="title">
                    {report.reason.replaceAll("_", " ")}
                  </AppText>
                  <AppText muted>
                    {report.property?.title ?? "Unknown property"}
                  </AppText>
                </View>
                <StatusPill
                  label={report.status}
                  tone={statusTone(report.status)}
                />
              </View>

              <AppText style={styles.description}>
                {report.description ?? "No additional details provided."}
              </AppText>

              <View style={styles.detailGrid}>
                <View style={styles.detailRow}>
                  <UserRound color={colors.muted} size={18} />
                  <View style={styles.grow}>
                    <AppText variant="label">Reporter</AppText>
                    <AppText muted>
                      {report.reporter?.name ?? "Unknown"} · {report.reporter?.email ?? "No email"}
                    </AppText>
                  </View>
                </View>
                <View style={styles.detailRow}>
                  <Building2 color={colors.muted} size={18} />
                  <View style={styles.grow}>
                    <AppText variant="label">Property owner</AppText>
                    <AppText muted>
                      {report.owner?.name ?? "Unknown"} · {report.owner?.listingCount ?? 0} listing(s)
                    </AppText>
                    {report.owner ? (
                      <AppText muted>
                        {report.owner.email} · {report.owner.phone ?? "No phone"} · {report.owner.accountStatus}
                      </AppText>
                    ) : null}
                  </View>
                </View>
              </View>

              <AppText variant="caption" muted>
                Submitted {new Date(report.createdAt).toLocaleString("en-GH")}
              </AppText>

              {!closed ? (
                <>
                  <AppInput
                    label="Moderation reason"
                    value={reasons[report.id] ?? ""}
                    onChangeText={(value) => {
                      setReasons((current) => ({
                        ...current,
                        [report.id]: value,
                      }));
                      setError(undefined);
                    }}
                    placeholder="Required for listing or owner suspension"
                    multiline
                    maxLength={1000}
                  />
                  <View style={styles.actions}>
                    {report.property ? (
                      <AppButton
                        title="Review Property"
                        variant="secondary"
                        onPress={() =>
                          router.push(
                            `/super-admin/approvals/${report.property?.id}` as Href,
                          )
                        }
                      />
                    ) : null}
                    {report.status === "OPEN" ? (
                      <AppButton
                        title="Start Review"
                        loading={loading}
                        onPress={() => void runAction(report, "start_review")}
                      />
                    ) : null}
                    <View style={styles.actionRow}>
                      <View style={styles.grow}>
                        <AppButton
                          title="Resolve"
                          loading={loading}
                          onPress={() => void runAction(report, "resolve")}
                        />
                      </View>
                      <View style={styles.grow}>
                        <AppButton
                          title="Dismiss"
                          variant="secondary"
                          loading={loading}
                          onPress={() => void runAction(report, "dismiss")}
                        />
                      </View>
                    </View>
                    <AppButton
                      title="Suspend Listing"
                      variant="danger"
                      loading={loading}
                      onPress={() => confirmAction(report, "suspend_listing")}
                    />
                    <AppButton
                      title="Suspend Owner and All Listings"
                      variant="danger"
                      loading={loading}
                      disabled={!report.owner}
                      onPress={() => confirmAction(report, "suspend_owner")}
                    />
                  </View>
                </>
              ) : null}
            </AdminCard>
          );
        })}

        {!reports.isLoading && !reports.data?.items.length ? (
          <AdminCard>
            <AppText variant="title">No reports found</AppText>
            <AppText muted style={styles.description}>
              There are no {status === "all" ? "" : `${status} `}property reports to review.
            </AppText>
          </AdminCard>
        ) : null}
      </View>
    </SuperAdminShell>
  );
}

const styles = StyleSheet.create({
  filters: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  filter: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 13,
    paddingVertical: 8,
  },
  filterSelected: {
    backgroundColor: colors.surfaceBlue,
    borderColor: colors.primary,
  },
  stack: { gap: 14 },
  header: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 10,
  },
  grow: { flex: 1 },
  description: { marginTop: 10 },
  detailGrid: { gap: 10, marginVertical: 14 },
  detailRow: { alignItems: "flex-start", flexDirection: "row", gap: 10 },
  actions: { gap: 10, marginTop: 12 },
  actionRow: { flexDirection: "row", gap: 10 },
});

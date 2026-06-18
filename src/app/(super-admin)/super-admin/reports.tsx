import { AdminCard, StatusPill, SuperAdminShell } from "@/components/super-admin/super-admin-shell";
import { AppButton } from "@/components/ui/app-button";
import { AppInput } from "@/components/ui/app-input";
import { AppText } from "@/components/ui/app-text";
import { colors } from "@/components/ui/design-system";
import { useSuperAdminReportAction, useSuperAdminReports } from "@/services/queries/hooks";
import { router, type Href } from "expo-router";
import { AlertTriangle } from "lucide-react-native";
import { useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

export default function ReportedListingsScreen() {
  const [reason, setReason] = useState("");
  const reports = useSuperAdminReports({ pageSize: 30 });
  const action = useSuperAdminReportAction();

  return (
    <SuperAdminShell title="Reported Listings" subtitle="Review marketplace reports and take moderation action.">
      <AppInput label="Reason for suspension" value={reason} onChangeText={setReason} placeholder="Required when suspending a listing" />
      {reports.isLoading ? <ActivityIndicator color={colors.primary} /> : null}
      <View style={styles.stack}>
        {(reports.data?.items ?? []).map((report) => (
          <AdminCard key={report.id}>
            <View style={styles.header}>
              <AlertTriangle size={22} color={colors.error} />
              <View style={{ flex: 1 }}>
                <AppText variant="title">{report.reason}</AppText>
                <AppText muted>{report.property?.title ?? "Unknown property"}</AppText>
              </View>
              <StatusPill label={report.status} tone={report.status === "OPEN" ? "danger" : "neutral"} />
            </View>
            <AppText style={{ marginTop: 8 }}>{report.description ?? "No report details provided."}</AppText>
            <AppText muted>
              Reporter: {report.reporter?.name ?? "Unknown"} - {new Date(report.createdAt).toLocaleDateString()}
            </AppText>
            <View style={styles.actions}>
              {report.property ? <AppButton title="Review Details" variant="secondary" onPress={() => router.push(`/super-admin/approvals/${report.property?.id}` as Href)} /> : null}
              <AppButton title="Resolve" loading={action.isPending} onPress={() => action.mutate({ reportId: report.id, action: "resolve" })} />
              <AppButton title="Dismiss" variant="secondary" loading={action.isPending} onPress={() => action.mutate({ reportId: report.id, action: "dismiss" })} />
              <AppButton title="Suspend Listing" variant="danger" loading={action.isPending} onPress={() => action.mutate({ reportId: report.id, action: "suspend_listing", reason })} />
            </View>
          </AdminCard>
        ))}
        {!reports.data?.items.length ? <AppText muted>No reported listings yet.</AppText> : null}
      </View>
    </SuperAdminShell>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: 14,
  },
  header: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 10,
  },
  actions: {
    gap: 10,
    marginTop: 12,
  },
});

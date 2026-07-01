import { router, type Href } from "expo-router";
import { Calendar, FileCheck2, Search } from "lucide-react-native";
import { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";
import { AdminCard, StatusPill, SuperAdminShell } from "@/components/super-admin/super-admin-shell";
import { AppButton } from "@/components/ui/app-button";
import { AppInput } from "@/components/ui/app-input";
import { AppText } from "@/components/ui/app-text";
import { colors } from "@/components/ui/design-system";
import { useSuperAdminLandlordVerifications } from "@/services/queries/hooks";
import type { LandlordVerificationStatus } from "@/types/landlord";

const filters: { label: string; value: LandlordVerificationStatus | "all" }[] = [
  { label: "Pending", value: "PENDING" },
  { label: "Changes", value: "CHANGES_REQUESTED" },
  { label: "Rejected", value: "REJECTED" },
  { label: "Approved", value: "APPROVED" },
  { label: "All", value: "all" },
];

function toneFor(status: LandlordVerificationStatus) {
  if (status === "APPROVED") return "success";
  if (status === "REJECTED") return "danger";
  if (status === "PENDING" || status === "CHANGES_REQUESTED") return "warning";
  return "neutral";
}

export default function VendorVerificationReviewsScreen() {
  const [status, setStatus] = useState<LandlordVerificationStatus | "all">("PENDING");
  const [q, setQ] = useState("");
  const reviews = useSuperAdminLandlordVerifications({ pageSize: 30, status: status === "all" ? undefined : status, q });

  return (
    <SuperAdminShell title="Vendor Verification Reviews" subtitle="Review landlord and agency identity submissions before marketplace verification.">
      <AppInput label="Search vendors" value={q} onChangeText={setQ} placeholder="Name, agency, email or phone" left={<Search color={colors.outline} size={18} />} />
      <View style={styles.tabs}>
        {filters.map((item) => (
          <Pressable key={item.value} style={[styles.tab, status === item.value && styles.tabActive]} onPress={() => setStatus(item.value)}>
            <AppText variant="label" style={{ color: status === item.value ? colors.primary : colors.muted }}>
              {item.label}
            </AppText>
          </Pressable>
        ))}
      </View>

      {reviews.isLoading ? <ActivityIndicator color={colors.primary} /> : null}
      <View style={styles.stack}>
        {(reviews.data?.items ?? []).map((item) => (
          <AdminCard key={item.id}>
            <View style={styles.row}>
              <View style={styles.iconWrap}>
                <FileCheck2 color={colors.primary} size={24} />
              </View>
              <View style={{ flex: 1, gap: 6 }}>
                <View style={styles.titleRow}>
                  <AppText variant="title" style={{ color: colors.primary }}>
                    {item.legalName ?? item.user?.name ?? "Unnamed vendor"}
                  </AppText>
                  <StatusPill label={item.verificationStatus.replaceAll("_", " ")} tone={toneFor(item.verificationStatus)} />
                </View>
                <AppText muted>{item.agencyName ? `${item.agencyName} - ` : ""}{item.user?.email ?? "No email"}</AppText>
                <AppText muted>{item.identityDocumentType ?? "Identity document"} submitted for {item.landlordType.toLowerCase()} review</AppText>
                <View style={styles.metaRow}>
                  <Calendar color={colors.muted} size={16} />
                  <AppText muted>Updated {new Date(item.updatedAt).toLocaleDateString()}</AppText>
                </View>
                {item.verificationNotes ? <AppText style={{ color: colors.warning }}>{item.verificationNotes}</AppText> : null}
                <AppButton title="Review Vendor" onPress={() => router.push(`/super-admin/verifications/${item.id}` as Href)} />
              </View>
            </View>
          </AdminCard>
        ))}
        {!reviews.isLoading && !reviews.data?.items.length ? <AppText muted>No vendor verification submissions match this view.</AppText> : null}
      </View>
    </SuperAdminShell>
  );
}

const styles = StyleSheet.create({
  tabs: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tab: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  tabActive: {
    backgroundColor: colors.warningSoft,
    borderColor: colors.gold,
  },
  stack: {
    gap: 14,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  iconWrap: {
    alignItems: "center",
    backgroundColor: colors.surfaceBlue,
    borderRadius: 12,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  titleRow: {
    alignItems: "flex-start",
    gap: 8,
  },
  metaRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
  },
});

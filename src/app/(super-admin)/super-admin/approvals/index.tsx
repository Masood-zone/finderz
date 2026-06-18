import { AdminCard, StatusPill, SuperAdminShell } from "@/components/super-admin/super-admin-shell";
import { AppButton } from "@/components/ui/app-button";
import { AppInput } from "@/components/ui/app-input";
import { AppText } from "@/components/ui/app-text";
import { colors } from "@/components/ui/design-system";
import { useSuperAdminApprovals } from "@/services/queries/hooks";
import { router, type Href } from "expo-router";
import { Calendar, MapPin } from "lucide-react-native";
import { useState } from "react";
import { ActivityIndicator, Image, StyleSheet, View } from "react-native";

export default function PendingPropertyApprovalsScreen() {
  const [q, setQ] = useState("");
  const approvals = useSuperAdminApprovals({ pageSize: 20, q });

  return (
    <SuperAdminShell title="Pending Property Approvals" subtitle="Review listing submissions for the Ghanaian market.">
      <AppInput label="Search approvals" value={q} onChangeText={setQ} placeholder="Title, city, area" />
      {approvals.isLoading ? <ActivityIndicator color={colors.primary} /> : null}
      <View style={styles.stack}>
        {(approvals.data?.items ?? []).map((property) => (
          <AdminCard key={property.id}>
            <View style={styles.cardRow}>
              <Image source={{ uri: property.images[0]?.imageUrl ?? "https://images.unsplash.com/photo-1564013799919-ab600027ffc6" }} style={styles.image} />
              <View style={styles.info}>
                <View style={styles.titleRow}>
                  <AppText variant="title" style={{ color: colors.primary }}>
                    {property.title}
                  </AppText>
                  <StatusPill label={property.reportCount ? "Flagged" : "New Submission"} tone={property.reportCount ? "danger" : "warning"} />
                </View>
                <View style={styles.metaRow}>
                  <MapPin size={16} color={colors.muted} />
                  <AppText muted>
                    {property.area}, {property.city}
                  </AppText>
                </View>
                <AppText variant="title" style={{ color: colors.primary }}>
                  GHS {(property.rentAmount / 100).toLocaleString()} <AppText muted>/{property.paymentPeriod.toLowerCase()}</AppText>
                </AppText>
                <View style={styles.metaRow}>
                  <Calendar size={16} color={colors.muted} />
                  <AppText muted>Submitted {new Date(property.updatedAt).toLocaleDateString()}</AppText>
                </View>
                <AppText muted>
                  Landlord: {property.landlord.legalName ?? property.landlord.user?.name ?? "Unknown"} - {property.landlord.verificationStatus.replaceAll("_", " ")}
                </AppText>
                <AppButton title="Review Listing" onPress={() => router.push(`/super-admin/approvals/${property.id}` as Href)} />
              </View>
            </View>
          </AdminCard>
        ))}
        {!approvals.data?.items.length ? <AppText muted>No pending approvals match the current filters.</AppText> : null}
      </View>
    </SuperAdminShell>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: 14,
  },
  cardRow: {
    gap: 12,
  },
  image: {
    backgroundColor: colors.surfaceSoft,
    borderRadius: 8,
    height: 150,
    width: "100%",
  },
  info: {
    gap: 8,
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

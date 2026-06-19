import {
  AdminCard,
  StatusPill,
  SuperAdminShell,
} from "@/components/super-admin/super-admin-shell";
import { AppButton } from "@/components/ui/app-button";
import { AppInput } from "@/components/ui/app-input";
import { AppText } from "@/components/ui/app-text";
import { colors } from "@/components/ui/design-system";
import { getErrorMessage } from "@/lib/get-error-message";
import {
  useSuperAdminProperty,
  useSuperAdminPropertyAction,
} from "@/services/queries/hooks";
import { useLocalSearchParams } from "expo-router";
import { AlertCircle, Bath, Bed, MapPin } from "lucide-react-native";
import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function getModerationState(property: {
  approvalStatus: string;
  isAvailable: boolean;
}) {
  if (property.approvalStatus === "pending") return "pending";
  if (!property.isAvailable) return "suspended";
  if (property.approvalStatus === "approved") return "approved";
  return "rejected";
}

export default function PropertyReviewDetailsScreen() {
  const params = useLocalSearchParams<{ propertyId?: string | string[] }>();
  const propertyId = firstParam(params.propertyId) ?? "";
  const { data, error, isError, isLoading, refetch } =
    useSuperAdminProperty(propertyId);
  const moderationAction = useSuperAdminPropertyAction();
  const [reason, setReason] = useState("");
  const [pendingAction, setPendingAction] = useState<
    "approve" | "reject" | "request_changes" | "suspend" | null
  >(null);
  const property = data?.property;
  const moderationState = property
    ? getModerationState(property)
    : "pending";

  const submit = async (
    nextAction: "approve" | "reject" | "request_changes" | "suspend",
  ) => {
    setPendingAction(nextAction);
    try {
      await moderationAction.mutateAsync({
        propertyId: property?.id ?? propertyId,
        action: nextAction,
        reason,
      });
    } finally {
      setPendingAction(null);
    }
  };

  return (
    <SuperAdminShell
      title="Review Listing"
      subtitle="Inspect listing evidence, landlord verification, reports, and pricing."
    >
      {isLoading ? <ActivityIndicator color={colors.primary} /> : null}
      {isError ? (
        <AdminCard>
          <AppText variant="title" style={{ color: colors.error }}>
            Unable to load listing
          </AppText>
          <AppText muted style={{ marginTop: 6 }}>
            {getErrorMessage(error, "This review could not be loaded.")}
          </AppText>
          <View style={{ marginTop: 12 }}>
            <AppButton
              title="Try Again"
              variant="secondary"
              onPress={() => void refetch()}
            />
          </View>
        </AdminCard>
      ) : null}
      {!isLoading && !isError && !property ? (
        <AdminCard>
          <AppText variant="title">Listing unavailable</AppText>
          <AppText muted style={{ marginTop: 6 }}>
            This listing could not be found or is no longer available for
            review.
          </AppText>
        </AdminCard>
      ) : null}
      {property ? (
        <>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.gallery}
          >
            {(property.images.length
              ? property.images
              : [
                  {
                    imageUrl:
                      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6",
                    id: "fallback",
                  },
                ]
            ).map((image) => (
              <Image
                key={image.id ?? image.imageUrl}
                source={{ uri: image.imageUrl }}
                style={styles.heroImage}
              />
            ))}
          </ScrollView>

          <AdminCard>
            <View style={styles.between}>
              <View style={{ flex: 1 }}>
                <AppText variant="headline" style={{ color: colors.primary }}>
                  {property.title}
                </AppText>
                <View style={styles.metaRow}>
                  <MapPin size={16} color={colors.muted} />
                  <AppText muted>
                    {property.address}, {property.area}, {property.city}
                  </AppText>
                </View>
              </View>
              <StatusPill
                label={property.approvalStatus}
                tone={
                  property.approvalStatus === "pending" ? "warning" : "neutral"
                }
              />
            </View>
            <AppText
              variant="title"
              style={{ color: colors.primary, marginTop: 8 }}
            >
              GHS {(property.rentAmount / 100).toLocaleString()} /{" "}
              {property.paymentPeriod.toLowerCase()}
            </AppText>
            <View style={styles.specRow}>
              <View style={styles.spec}>
                <Bed size={20} color={colors.primary} />
                <AppText>{property.bedrooms} Bedrooms</AppText>
              </View>
              <View style={styles.spec}>
                <Bath size={20} color={colors.primary} />
                <AppText>{property.bathrooms} Baths</AppText>
              </View>
            </View>
            <AppText style={{ marginTop: 10 }}>{property.description}</AppText>
          </AdminCard>

          <AdminCard>
            <AppText variant="title">Amenities</AppText>
            <View style={styles.chips}>
              {property.amenities.map((amenity) => (
                <StatusPill key={amenity} label={amenity} />
              ))}
              {!property.amenities.length ? (
                <AppText muted>No amenities supplied.</AppText>
              ) : null}
            </View>
          </AdminCard>

          <AdminCard>
            <AppText variant="title">Landlord Profile</AppText>
            <AppText>
              {property.landlord.legalName ??
                property.landlord.user?.name ??
                "Unknown landlord"}
            </AppText>
            <AppText muted>{property.landlord.user?.email}</AppText>
            <StatusPill
              label={property.landlord.verificationStatus.replaceAll("_", " ")}
              tone={
                property.landlord.verificationStatus === "APPROVED"
                  ? "success"
                  : "warning"
              }
            />
          </AdminCard>

          <AdminCard>
            <AppText variant="title">Report History</AppText>
            <View style={styles.stack}>
              {property.reports.map((report) => (
                <View key={report.id} style={styles.auditRow}>
                  <AlertCircle size={18} color={colors.error} />
                  <View style={{ flex: 1 }}>
                    <AppText>{report.reason}</AppText>
                    <AppText muted>
                      {report.description ?? "No description"} - {report.status}
                    </AppText>
                  </View>
                </View>
              ))}
              {!property.reports.length ? (
                <AppText muted>No reports for this listing.</AppText>
              ) : null}
            </View>
          </AdminCard>

          <AdminCard>
            <AppText variant="title">Submission History</AppText>
            <View style={styles.stack}>
              {property.submissionHistory.map((item) => (
                <View key={item.id} style={styles.auditRow}>
                  <View style={styles.dot} />
                  <View style={{ flex: 1 }}>
                    <AppText>{item.action.replaceAll("_", " ")}</AppText>
                    <AppText muted>
                      {new Date(item.createdAt).toLocaleString()}
                    </AppText>
                  </View>
                </View>
              ))}
              {!property.submissionHistory.length ? (
                <AppText muted>
                  Submitted {new Date(property.createdAt).toLocaleString()}
                </AppText>
              ) : null}
            </View>
          </AdminCard>

          <AdminCard>
            <AppText variant="title">Moderation Reason</AppText>
            <AppInput
              label="Required for reject, changes, or suspension"
              value={reason}
              onChangeText={setReason}
              multiline
              placeholder="Describe what must change or why this action is needed."
            />
            <View style={styles.actionGrid}>
              {moderationState === "pending" ? (
                <>
                  <AppButton
                    title="Approve"
                    loading={pendingAction === "approve"}
                    disabled={Boolean(pendingAction) && pendingAction !== "approve"}
                    onPress={() => void submit("approve")}
                  />
                  <AppButton
                    title="Request Changes"
                    variant="secondary"
                    loading={pendingAction === "request_changes"}
                    disabled={Boolean(pendingAction) && pendingAction !== "request_changes"}
                    onPress={() => void submit("request_changes")}
                  />
                  <AppButton
                    title="Reject"
                    variant="danger"
                    loading={pendingAction === "reject"}
                    disabled={Boolean(pendingAction) && pendingAction !== "reject"}
                    onPress={() => void submit("reject")}
                  />
                  <AppButton
                    title="Suspend"
                    variant="danger"
                    loading={pendingAction === "suspend"}
                    disabled={Boolean(pendingAction) && pendingAction !== "suspend"}
                    onPress={() => void submit("suspend")}
                  />
                </>
              ) : (
                <>
                  <AppButton
                    title="Approved"
                    variant={moderationState === "approved" ? "primary" : "secondary"}
                    disabled
                  />
                  <AppButton
                    title="Rejected"
                    variant={moderationState === "rejected" ? "danger" : "secondary"}
                    disabled
                  />
                  <AppButton
                    title="Suspended"
                    variant={moderationState === "suspended" ? "danger" : "secondary"}
                    disabled
                  />
                </>
              )}
            </View>
          </AdminCard>
        </>
      ) : null}
    </SuperAdminShell>
  );
}

const styles = StyleSheet.create({
  gallery: {
    gap: 12,
  },
  heroImage: {
    backgroundColor: colors.surfaceSoft,
    borderRadius: 12,
    height: 220,
    width: 320,
  },
  between: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
  },
  metaRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
    marginTop: 6,
  },
  specRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },
  spec: {
    alignItems: "center",
    backgroundColor: colors.surfaceBlue,
    borderRadius: 10,
    flex: 1,
    gap: 6,
    padding: 12,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 10,
  },
  stack: {
    gap: 10,
    marginTop: 10,
  },
  auditRow: {
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
  actionGrid: {
    gap: 10,
    marginTop: 12,
  },
});

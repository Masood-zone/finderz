import { useEffect, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { AlertTriangle, CheckCircle2, X } from "lucide-react-native";
import { AppButton } from "@/components/ui/app-button";
import { AppInput } from "@/components/ui/app-input";
import { AppText } from "@/components/ui/app-text";
import { colors, radius, shadows } from "@/components/ui/design-system";
import { FormError } from "@/components/ui/form-error";
import { getErrorMessage } from "@/lib/get-error-message";

export const PROPERTY_REPORT_REASONS = [
  { value: "SCAM", label: "Scam" },
  { value: "MISLEADING", label: "Misleading" },
  { value: "UNAVAILABLE", label: "Unavailable" },
  { value: "DUPLICATE", label: "Duplicate" },
  { value: "OTHER", label: "Other" },
] as const;

export type PropertyReportReason =
  (typeof PROPERTY_REPORT_REASONS)[number]["value"];

type Props = {
  visible: boolean;
  propertyTitle: string;
  onClose: () => void;
  onSubmit: (input: {
    reason: PropertyReportReason;
    description?: string;
  }) => Promise<unknown>;
};

export function PropertyReportModal({
  visible,
  propertyTitle,
  onClose,
  onSubmit,
}: Props) {
  const [reason, setReason] = useState<PropertyReportReason>();
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string>();
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!visible) {
      setReason(undefined);
      setDescription("");
      setError(undefined);
      setSubmitted(false);
      setSubmitting(false);
    }
  }, [visible]);

  const close = () => {
    if (!submitting) {
      onClose();
    }
  };

  const submit = async () => {
    const details = description.trim();

    if (!reason) {
      setError("Choose a reason for your report.");
      return;
    }

    if (reason === "OTHER" && !details) {
      setError("Describe what is wrong with this listing.");
      return;
    }

    setSubmitting(true);
    setError(undefined);

    try {
      await onSubmit({ reason, description: details || undefined });
      setSubmitted(true);
    } catch (submitError) {
      setError(
        getErrorMessage(
          submitError,
          "Unable to submit this report. Check your connection and try again.",
        ),
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="slide"
      presentationStyle="overFullScreen"
      statusBarTranslucent
      onRequestClose={close}
    >
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={close} />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <View style={styles.icon}>
              {submitted ? (
                <CheckCircle2 color={colors.success} size={24} />
              ) : (
                <AlertTriangle color={colors.error} size={24} />
              )}
            </View>
            <View style={styles.headerCopy}>
              <AppText variant="title">
                {submitted ? "Report received" : "Report this listing"}
              </AppText>
              <AppText muted numberOfLines={2}>
                {submitted
                  ? "FinderZ administrators have been alerted and will review it."
                  : propertyTitle}
              </AppText>
            </View>
            <Pressable
              accessibilityLabel="Close report form"
              accessibilityRole="button"
              onPress={close}
              disabled={submitting}
              style={styles.close}
            >
              <X color={colors.muted} size={22} />
            </Pressable>
          </View>

          {submitted ? (
            <AppButton title="Done" onPress={close} />
          ) : (
            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.form}
            >
              <View>
                <AppText variant="label" muted style={styles.label}>
                  What is wrong with this listing?
                </AppText>
                <View style={styles.reasons}>
                  {PROPERTY_REPORT_REASONS.map((item) => {
                    const selected = reason === item.value;
                    return (
                      <Pressable
                        key={item.value}
                        accessibilityRole="radio"
                        accessibilityState={{ selected }}
                        onPress={() => {
                          setReason(item.value);
                          setError(undefined);
                        }}
                        style={[styles.reason, selected && styles.reasonSelected]}
                      >
                        <AppText
                          variant="label"
                          style={{ color: selected ? colors.primary : colors.text }}
                        >
                          {item.label}
                        </AppText>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <AppInput
                label={reason === "OTHER" ? "Details (required)" : "Details (optional)"}
                placeholder="Share any details that will help FinderZ investigate."
                value={description}
                onChangeText={(value) => {
                  setDescription(value.slice(0, 1000));
                  setError(undefined);
                }}
                maxLength={1000}
                multiline
                textAlignVertical="top"
              />
              <AppText variant="caption" muted style={styles.counter}>
                {description.length}/1000
              </AppText>
              <FormError title="Report not submitted" message={error} />
              <AppButton
                title="Submit Report"
                variant="danger"
                loading={submitting}
                onPress={submit}
              />
              <AppButton
                title="Cancel"
                variant="secondary"
                disabled={submitting}
                onPress={close}
              />
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: "rgba(2, 16, 45, 0.55)",
    flex: 1,
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    maxHeight: "88%",
    padding: 20,
    paddingBottom: 32,
    ...shadows.md,
  },
  handle: {
    alignSelf: "center",
    backgroundColor: colors.border,
    borderRadius: 999,
    height: 4,
    marginBottom: 18,
    width: 44,
  },
  header: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  headerCopy: { flex: 1, gap: 3 },
  icon: {
    alignItems: "center",
    backgroundColor: colors.errorSoft,
    borderRadius: 999,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  close: { padding: 4 },
  form: { gap: 14, paddingBottom: 8 },
  label: { marginBottom: 8, marginLeft: 4 },
  reasons: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  reason: {
    backgroundColor: colors.surfaceSoft,
    borderColor: colors.border,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  reasonSelected: {
    backgroundColor: colors.surfaceBlue,
    borderColor: colors.primary,
  },
  counter: { marginTop: -10, textAlign: "right" },
});

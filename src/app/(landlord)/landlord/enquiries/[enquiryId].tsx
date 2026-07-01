import { useEffect, useRef, useState } from "react";
import { Alert, KeyboardAvoidingView, Linking, Platform, Pressable, ScrollView, TextInput, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { ArrowLeft, Phone, Send } from "lucide-react-native";
import { AppButton } from "@/components/ui/app-button";
import { AppText } from "@/components/ui/app-text";
import { colors, radius } from "@/components/ui/design-system";
import { SafeAreaScreen } from "@/components/ui/safe-area-screen";
import { TenantAvatar } from "@/components/tenant/tenant-shell";
import { TenantErrorState, TenantSkeleton } from "@/components/tenant/tenant-state";
import { getErrorMessage } from "@/lib/get-error-message";
import { useLandlordEnquiry, useReplyLandlordEnquiry } from "@/services/queries/hooks";

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default function LandlordEnquiryDetailScreen() {
  const params = useLocalSearchParams<{ enquiryId?: string }>();
  const enquiryId = firstParam(params.enquiryId) ?? "";
  const enquiry = useLandlordEnquiry(enquiryId);
  const reply = useReplyLandlordEnquiry();
  const [message, setMessage] = useState("");
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    const focusTimer = setTimeout(() => inputRef.current?.focus(), 300);
    return () => clearTimeout(focusTimer);
  }, [enquiryId]);

  if (enquiry.isLoading) {
    return <TenantSkeleton variant="conversation" />;
  }

  if (enquiry.isError || !enquiry.data) {
    return (
      <SafeAreaScreen>
        <TenantErrorState title="Conversation unavailable" message={getErrorMessage(enquiry.error, "Unable to load this enquiry.")} onRetry={() => void enquiry.refetch()} />
      </SafeAreaScreen>
    );
  }

  const tenant = enquiry.data.enquiry.tenant;
  const tenantPhone = tenant.phone?.trim() ?? "";
  const canCallTenant = Boolean(tenantPhone);

  const callTenant = async () => {
    if (!canCallTenant) {
      Alert.alert("Phone unavailable", "This tenant has not added a phone number yet.");
      return;
    }

    const dialNumber = tenantPhone.replace(/[^+\d]/g, "");
    if (!dialNumber) {
      Alert.alert("Phone unavailable", "This tenant phone number is not valid for calling.");
      return;
    }

    try {
      await Linking.openURL(`tel:${dialNumber}`);
    } catch {
      Alert.alert("Unable to place call", "Your phone could not open the dialer right now.");
    }
  };

  const sendReply = async () => {
    const content = message.trim();
    if (!content) {
      return;
    }

    try {
      await reply.mutateAsync({ enquiryId, content });
      setMessage("");
    } catch (error) {
      Alert.alert("Unable to send reply", getErrorMessage(error, "Please try again."));
    }
  };

  return (
    <SafeAreaScreen>
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View className="flex-row items-center gap-3 border-b px-4 py-4" style={{ backgroundColor: colors.background, borderColor: colors.border }}>
          <Pressable className="h-10 w-10 items-center justify-center" style={{ borderRadius: radius.lg, backgroundColor: colors.surface }} onPress={() => router.back()}>
            <ArrowLeft color={colors.primary} size={20} />
          </Pressable>
          <TenantAvatar name={tenant.name} image={tenant.image} size={44} />
          <View className="min-w-0 flex-1">
            <AppText variant="title" numberOfLines={1}>
              {tenant.name}
            </AppText>
            <AppText variant="caption" muted numberOfLines={1}>
              {enquiry.data.enquiry.property.title}
            </AppText>
            {tenantPhone ? (
              <AppText variant="caption" style={{ color: colors.primary, fontFamily: "Manrope_700Bold" }}>
                {tenantPhone}
              </AppText>
            ) : null}
          </View>
          <Pressable
            className="h-11 w-11 items-center justify-center"
            style={{ borderRadius: radius.xl, backgroundColor: canCallTenant ? colors.primary : colors.surfaceBlue, opacity: canCallTenant ? 1 : 0.55 }}
            onPress={() => void callTenant()}
          >
            <Phone color={canCallTenant ? "#fff" : colors.primary} size={20} />
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 20 }} showsVerticalScrollIndicator={false}>
          <View className="rounded-2xl border p-4" style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
            <AppText variant="caption" muted>
              Enquiry for
            </AppText>
            <AppText style={{ fontFamily: "Manrope_700Bold" }}>
              {enquiry.data.enquiry.property.title}
            </AppText>
            <AppText variant="caption" muted>
              {enquiry.data.enquiry.property.area}, {enquiry.data.enquiry.property.city} - Prefers {enquiry.data.enquiry.preferredContactMethod.toLowerCase()}
            </AppText>
          </View>

          {enquiry.data.messages.map((item) => {
            const mine = item.senderId !== tenant.id;
            return (
              <View key={item.id} className={`max-w-[84%] rounded-2xl p-4 ${mine ? "self-end" : "self-start"}`} style={{ backgroundColor: mine ? colors.primary : colors.surface }}>
                <AppText style={{ color: mine ? "#fff" : colors.text }}>{item.content}</AppText>
                <AppText variant="caption" className="mt-2" style={{ color: mine ? colors.primaryMuted : colors.muted }}>
                  {new Date(item.createdAt).toLocaleString()}
                </AppText>
              </View>
            );
          })}
        </ScrollView>

        <View className="border-t p-4" style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
          <View className="flex-row items-end gap-3">
            <TextInput
              ref={inputRef}
              multiline
              autoFocus
              showSoftInputOnFocus
              value={message}
              onChangeText={setMessage}
              placeholder="Reply to tenant"
              placeholderTextColor={colors.outline}
              style={{
                minHeight: 48,
                maxHeight: 108,
                flex: 1,
                borderRadius: radius.lg,
                backgroundColor: colors.surfaceSoft,
                borderWidth: 1,
                borderColor: colors.border,
                color: colors.text,
                fontFamily: "Manrope_400Regular",
                paddingHorizontal: 14,
                paddingVertical: 12,
                textAlignVertical: "top",
              }}
            />
            <View style={{ width: 56 }}>
              <AppButton title="" loading={reply.isPending} icon={<Send color="#fff" size={18} />} style={{ minHeight: 48, paddingHorizontal: 0 }} onPress={() => void sendReply()} />
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaScreen>
  );
}

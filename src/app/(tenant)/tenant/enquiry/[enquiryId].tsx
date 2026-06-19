import { Alert, Linking, Pressable, ScrollView, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { ArrowLeft, Phone } from "lucide-react-native";
import { AppButton } from "@/components/ui/app-button";
import { AppText } from "@/components/ui/app-text";
import { colors, radius } from "@/components/ui/design-system";
import { SafeAreaScreen } from "@/components/ui/safe-area-screen";
import { TenantErrorState, TenantSkeleton } from "@/components/tenant/tenant-state";
import { getErrorMessage } from "@/lib/get-error-message";
import { useTenantEnquiry } from "@/services/queries/hooks";

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default function TenantEnquiryDetailScreen() {
  const params = useLocalSearchParams<{ enquiryId?: string }>();
  const enquiryId = firstParam(params.enquiryId) ?? "";
  const enquiry = useTenantEnquiry(enquiryId);

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

  const landlordPhone = enquiry.data.enquiry.landlord.phone?.trim() ?? "";
  const canCallLandlord = Boolean(landlordPhone);

  const callLandlord = async () => {
    if (!canCallLandlord) {
      Alert.alert("Phone unavailable", "This landlord has not added a phone number yet.");
      return;
    }

    const dialNumber = landlordPhone.replace(/[^+\d]/g, "");
    if (!dialNumber) {
      Alert.alert("Phone unavailable", "This landlord phone number is not valid for calling.");
      return;
    }

    try {
      await Linking.openURL(`tel:${dialNumber}`);
    } catch {
      Alert.alert("Unable to place call", "Your phone could not open the dialer right now.");
    }
  };

  return (
    <SafeAreaScreen>
      <View className="flex-row items-center gap-3 px-4 py-4">
        <Pressable className="h-10 w-10 items-center justify-center" style={{ borderRadius: radius.lg, backgroundColor: colors.surface }} onPress={() => router.back()}>
          <ArrowLeft color={colors.primary} size={20} />
        </Pressable>
        <View className="min-w-0 flex-1">
          <AppText variant="title" numberOfLines={1}>
            {enquiry.data.enquiry.property.title}
          </AppText>
          <AppText variant="caption" muted>
            {enquiry.data.enquiry.landlord.name}
          </AppText>
          {landlordPhone ? (
            <AppText variant="caption" style={{ color: colors.primary, fontFamily: "Manrope_700Bold" }}>
              {landlordPhone}
            </AppText>
          ) : null}
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 120 }}>
        {enquiry.data.messages.map((message) => {
          const mine = message.senderId !== enquiry.data.enquiry.landlord.id;
          return (
            <View key={message.id} className={`max-w-[84%] rounded-2xl p-4 ${mine ? "self-end" : "self-start"}`} style={{ backgroundColor: mine ? colors.primary : colors.surface }}>
              <AppText style={{ color: mine ? "#fff" : colors.text }}>{message.content}</AppText>
              <AppText variant="caption" className="mt-2" style={{ color: mine ? colors.primaryMuted : colors.muted }}>
                {new Date(message.createdAt).toLocaleString()}
              </AppText>
            </View>
          );
        })}
      </ScrollView>

      <View className="border-t p-4" style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
        <AppButton
          title={canCallLandlord ? "Call Landlord" : "Phone Unavailable"}
          icon={<Phone color="#fff" size={18} />}
          disabled={!canCallLandlord}
          onPress={() => void callLandlord()}
        />
      </View>
    </SafeAreaScreen>
  );
}

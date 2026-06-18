import { zodResolver } from "@hookform/resolvers/zod";
import { router, type Href } from "expo-router";
import { Controller, useForm, type Resolver } from "react-hook-form";
import { z } from "zod";
import { Pressable, ScrollView, View } from "react-native";
import { AppButton } from "@/components/ui/app-button";
import { AppInput } from "@/components/ui/app-input";
import { AppText } from "@/components/ui/app-text";
import { colors } from "@/components/ui/design-system";
import { ScreenShell } from "@/components/ui/screen-shell";
import { useLandlordPropertyDraftStore } from "@/store/landlord-property-draft-store";

const schema = z.object({
  region: z.string().trim().min(2, "Enter region."),
  city: z.string().trim().min(2, "Enter city."),
  area: z.string().trim().min(2, "Enter area."),
  landmark: z.string().trim().optional(),
  address: z.string().trim().min(3, "Enter address."),
  latitude: z.string().trim().optional(),
  longitude: z.string().trim().optional(),
  rentAmountCedis: z.coerce.number().min(1, "Enter rent in Ghana cedis."),
  paymentPeriod: z.enum(["MONTHLY", "QUARTERLY", "BIANNUALLY", "YEARLY"]),
  advancePeriodMonths: z.coerce.number().int().min(1),
  isNegotiable: z.boolean(),
  additionalCharges: z.string().trim().optional(),
  availableFrom: z.string().trim().optional(),
});

type FormValues = z.infer<typeof schema>;

function Option({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable className="rounded-full px-4 py-3" style={{ backgroundColor: active ? colors.primary : colors.surfaceBlue }} onPress={onPress}>
      <AppText variant="caption" style={{ color: active ? "#fff" : colors.primary, fontFamily: "Manrope_700Bold" }}>
        {label}
      </AppText>
    </Pressable>
  );
}

export default function LocationPricingScreen() {
  const { draft, mergeDraft } = useLandlordPropertyDraftStore();
  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
    defaultValues: {
      region: draft.region,
      city: draft.city,
      area: draft.area,
      landmark: draft.landmark ?? "",
      address: draft.address,
      latitude: draft.latitude ?? "",
      longitude: draft.longitude ?? "",
      rentAmountCedis: draft.rentAmountCedis,
      paymentPeriod: draft.paymentPeriod as FormValues["paymentPeriod"],
      advancePeriodMonths: draft.advancePeriodMonths,
      isNegotiable: draft.isNegotiable,
      additionalCharges: draft.additionalCharges ?? "",
      availableFrom: draft.availableFrom ?? "",
    },
  });

  const onNext = form.handleSubmit((values) => {
    mergeDraft(values);
    router.push("/landlord/properties/create/review-submit" as Href);
  });

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <ScreenShell title="Add Property" subtitle="Location and Pricing" showBack>
        <ScrollView contentContainerStyle={{ paddingTop: 20, paddingBottom: 80, gap: 18 }} showsVerticalScrollIndicator={false}>
          <Controller control={form.control} name="region" render={({ field, fieldState }) => <AppInput label="Region" value={field.value} onChangeText={field.onChange} error={fieldState.error?.message} />} />
          <Controller control={form.control} name="city" render={({ field, fieldState }) => <AppInput label="City" value={field.value} onChangeText={field.onChange} error={fieldState.error?.message} />} />
          <Controller control={form.control} name="area" render={({ field, fieldState }) => <AppInput label="Area" value={field.value} onChangeText={field.onChange} error={fieldState.error?.message} />} />
          <Controller control={form.control} name="landmark" render={({ field }) => <AppInput label="Landmark" value={field.value} onChangeText={field.onChange} />} />
          <Controller control={form.control} name="address" render={({ field, fieldState }) => <AppInput label="Address" value={field.value} onChangeText={field.onChange} error={fieldState.error?.message} />} />
          <View className="flex-row gap-3">
            <Controller control={form.control} name="latitude" render={({ field }) => <AppInput label="Latitude" value={field.value} onChangeText={field.onChange} keyboardType="decimal-pad" />} />
            <Controller control={form.control} name="longitude" render={({ field }) => <AppInput label="Longitude" value={field.value} onChangeText={field.onChange} keyboardType="decimal-pad" />} />
          </View>
          <Controller control={form.control} name="rentAmountCedis" render={({ field, fieldState }) => <AppInput label="Rent Amount (GH₵)" value={String(field.value || "")} onChangeText={(value) => field.onChange(Number(value) || 0)} keyboardType="decimal-pad" error={fieldState.error?.message} />} />
          <Controller
            control={form.control}
            name="paymentPeriod"
            render={({ field }) => (
              <View>
                <AppText variant="label" muted className="mb-2 ml-1">
                  Payment Period
                </AppText>
                <View className="flex-row flex-wrap gap-2">
                  {(["MONTHLY", "QUARTERLY", "BIANNUALLY", "YEARLY"] as const).map((item) => (
                    <Option key={item} label={item.toLowerCase()} active={field.value === item} onPress={() => field.onChange(item)} />
                  ))}
                </View>
              </View>
            )}
          />
          <Controller control={form.control} name="advancePeriodMonths" render={({ field }) => <AppInput label="Advance Period (months)" value={String(field.value)} onChangeText={(value) => field.onChange(Number(value) || 1)} keyboardType="number-pad" />} />
          <Controller
            control={form.control}
            name="isNegotiable"
            render={({ field }) => (
              <View className="flex-row gap-2">
                <Option label="Negotiable" active={field.value} onPress={() => field.onChange(true)} />
                <Option label="Fixed price" active={!field.value} onPress={() => field.onChange(false)} />
              </View>
            )}
          />
          <Controller control={form.control} name="additionalCharges" render={({ field }) => <AppInput label="Additional Charges" value={field.value} onChangeText={field.onChange} />} />
          <Controller control={form.control} name="availableFrom" render={({ field }) => <AppInput label="Available Date (YYYY-MM-DD)" value={field.value} onChangeText={field.onChange} />} />
          <AppButton title="Continue" onPress={onNext} />
        </ScrollView>
      </ScreenShell>
    </View>
  );
}

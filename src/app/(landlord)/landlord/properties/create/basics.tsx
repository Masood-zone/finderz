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
  title: z.string().trim().min(2, "Enter a listing title."),
  propertyType: z.enum(["APARTMENT", "HOUSE", "ROOM", "STUDIO", "HOSTEL", "COMMERCIAL"]),
  description: z.string().trim().min(10, "Add a short description."),
  bedrooms: z.coerce.number().int().min(0),
  bathrooms: z.coerce.number().int().min(0),
  furnishingStatus: z.enum(["FURNISHED", "SEMI_FURNISHED", "UNFURNISHED"]),
  isAvailable: z.boolean(),
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

export default function AddPropertyBasicsScreen() {
  const { draft, mergeDraft } = useLandlordPropertyDraftStore();
  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
    defaultValues: {
      title: draft.title,
      propertyType: draft.propertyType as FormValues["propertyType"],
      description: draft.description,
      bedrooms: draft.bedrooms,
      bathrooms: draft.bathrooms,
      furnishingStatus: draft.furnishingStatus as FormValues["furnishingStatus"],
      isAvailable: draft.isAvailable,
    },
  });

  const onNext = form.handleSubmit((values) => {
    mergeDraft(values);
    router.push("/landlord/properties/create/location-pricing" as Href);
  });

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <ScreenShell title="Add Property" subtitle="Basics" showBack>
        <ScrollView contentContainerStyle={{ paddingTop: 20, paddingBottom: 80, gap: 18 }} showsVerticalScrollIndicator={false}>
          <Controller control={form.control} name="title" render={({ field, fieldState }) => <AppInput label="Title" value={field.value} onChangeText={field.onChange} error={fieldState.error?.message} />} />
          <Controller
            control={form.control}
            name="propertyType"
            render={({ field }) => (
              <View>
                <AppText variant="label" muted className="mb-2 ml-1">
                  Property Type
                </AppText>
                <View className="flex-row flex-wrap gap-2">
                  {(["APARTMENT", "HOUSE", "ROOM", "STUDIO", "HOSTEL", "COMMERCIAL"] as const).map((item) => (
                    <Option key={item} label={item.toLowerCase()} active={field.value === item} onPress={() => field.onChange(item)} />
                  ))}
                </View>
              </View>
            )}
          />
          <Controller control={form.control} name="description" render={({ field, fieldState }) => <AppInput label="Description" value={field.value} onChangeText={field.onChange} multiline style={{ minHeight: 96, textAlignVertical: "top", paddingVertical: 12 }} error={fieldState.error?.message} />} />
          <View className="flex-row gap-3">
            <Controller control={form.control} name="bedrooms" render={({ field }) => <AppInput label="Bedrooms" value={String(field.value)} onChangeText={(value) => field.onChange(Number(value) || 0)} keyboardType="number-pad" style={{ minWidth: 0 }} />} />
            <Controller control={form.control} name="bathrooms" render={({ field }) => <AppInput label="Bathrooms" value={String(field.value)} onChangeText={(value) => field.onChange(Number(value) || 0)} keyboardType="number-pad" style={{ minWidth: 0 }} />} />
          </View>
          <Controller
            control={form.control}
            name="furnishingStatus"
            render={({ field }) => (
              <View>
                <AppText variant="label" muted className="mb-2 ml-1">
                  Furnishing
                </AppText>
                <View className="flex-row flex-wrap gap-2">
                  {(["FURNISHED", "SEMI_FURNISHED", "UNFURNISHED"] as const).map((item) => (
                    <Option key={item} label={item.replace("_", " ").toLowerCase()} active={field.value === item} onPress={() => field.onChange(item)} />
                  ))}
                </View>
              </View>
            )}
          />
          <Controller
            control={form.control}
            name="isAvailable"
            render={({ field }) => (
              <View className="flex-row gap-2">
                <Option label="Available now" active={field.value} onPress={() => field.onChange(true)} />
                <Option label="Unavailable" active={!field.value} onPress={() => field.onChange(false)} />
              </View>
            )}
          />
          <AppButton title="Continue" onPress={onNext} />
        </ScrollView>
      </ScreenShell>
    </View>
  );
}

import {
  AddPropertyNote,
  AddPropertyPanel,
  AddPropertyShell,
} from "@/components/landlord/add-property-shell";
import { AppButton } from "@/components/ui/app-button";
import { AppInput } from "@/components/ui/app-input";
import { AppText } from "@/components/ui/app-text";
import { colors } from "@/components/ui/design-system";
import { useLandlordPropertyDraftStore } from "@/store/landlord-property-draft-store";
import { zodResolver } from "@hookform/resolvers/zod";
import { router, type Href } from "expo-router";
import {
  Bath,
  BedDouble,
  Building,
  Building2,
  Home,
  Info,
  Minus,
  Plus,
  Rows3,
  Save,
} from "lucide-react-native";
import type { ComponentType } from "react";
import { Controller, useForm, type Resolver } from "react-hook-form";
import { Pressable, View } from "react-native";
import { z } from "zod";

const schema = z.object({
  title: z.string().trim().min(2, "Enter a listing title."),
  propertyType: z.enum([
    "APARTMENT",
    "HOUSE",
    "ROOM",
    "STUDIO",
    "HOSTEL",
    "COMMERCIAL",
  ]),
  description: z.string().trim().min(10, "Add a short description."),
  bedrooms: z.coerce.number().int().min(0),
  bathrooms: z.coerce.number().int().min(0),
  furnishingStatus: z.enum(["FURNISHED", "SEMI_FURNISHED", "UNFURNISHED"]),
  isAvailable: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

const propertyTypes = [
  { value: "APARTMENT", label: "Apartment", icon: Building },
  { value: "HOUSE", label: "House", icon: Home },
  { value: "ROOM", label: "Room", icon: Building2 },
  { value: "STUDIO", label: "Studio", icon: Rows3 },
] as const;

function Option({
  label,
  active,
  onPress,
  icon: Icon,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  icon?: ComponentType<{ color: string; size: number }>;
}) {
  return (
    <Pressable
      className="flex-row items-center gap-2 rounded-full border px-4 py-3"
      style={{
        backgroundColor: active ? "#dce1ff" : colors.surface,
        borderColor: active ? colors.primary : colors.borderStrong,
      }}
      onPress={onPress}
    >
      {Icon ? <Icon color={colors.primary} size={18} /> : null}
      <AppText
        variant="caption"
        style={{
          color: active ? colors.primary : colors.text,
          fontFamily: "Manrope_700Bold",
        }}
      >
        {label}
      </AppText>
    </Pressable>
  );
}

function Counter({
  label,
  value,
  onChange,
  icon: Icon,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  icon: ComponentType<{ color: string; size: number }>;
}) {
  return (
    <View className="min-w-0 flex-1">
      <AppText variant="label" muted className="mb-2 ml-1">
        {label}
      </AppText>
      <View
        className="h-12 flex-row items-center rounded-xl border"
        style={{
          backgroundColor: colors.surface,
          borderColor: colors.borderStrong,
        }}
      >
        <Pressable
          className="h-full w-12 items-center justify-center"
          onPress={() => onChange(Math.max(0, value - 1))}
        >
          <Minus color={colors.primary} size={18} />
        </Pressable>
        <View className="min-w-0 flex-1 flex-row items-center justify-center gap-2">
          <Icon color={colors.primary} size={18} />
          <AppText variant="title" style={{ color: colors.primary }}>
            {value}
          </AppText>
        </View>
        <Pressable
          className="h-full w-12 items-center justify-center"
          onPress={() => onChange(value + 1)}
        >
          <Plus color={colors.primary} size={18} />
        </Pressable>
      </View>
    </View>
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
      furnishingStatus:
        draft.furnishingStatus as FormValues["furnishingStatus"],
      isAvailable: draft.isAvailable,
    },
  });

  const onNext = form.handleSubmit((values) => {
    mergeDraft(values);
    router.push("/landlord/properties/create/location-pricing" as Href);
  });

  const saveDraft = form.handleSubmit((values) => {
    mergeDraft(values);
    router.push("/landlord/properties/create/review-submit" as Href);
  });

  return (
    <AddPropertyShell
      currentStep={1}
      footer={
        <View className="gap-3">
          <AppButton
            title="Continue to Step 2"
            icon={<Plus color={colors.goldDark} size={18} />}
            onPress={onNext}
          />
          <AppButton
            title="Save as Draft"
            variant="secondary"
            icon={<Save color={colors.primary} size={18} />}
            onPress={saveDraft}
          />
        </View>
      }
    >
      <AddPropertyPanel>
        <View className="gap-5">
          <Controller
            control={form.control}
            name="title"
            render={({ field, fieldState }) => (
              <AppInput
                label="Title"
                value={field.value}
                onChangeText={field.onChange}
                error={fieldState.error?.message}
              />
            )}
          />
          <Controller
            control={form.control}
            name="propertyType"
            render={({ field }) => (
              <View>
                <AppText variant="label" muted className="mb-2 ml-1">
                  Property Type
                </AppText>
                <View className="flex-row flex-wrap gap-2">
                  {propertyTypes.map((item) => (
                    <Option
                      key={item.value}
                      label={item.label}
                      icon={item.icon}
                      active={field.value === item.value}
                      onPress={() => field.onChange(item.value)}
                    />
                  ))}
                </View>
              </View>
            )}
          />
          <Controller
            control={form.control}
            name="description"
            render={({ field, fieldState }) => (
              <AppInput
                label="Detailed Description"
                value={field.value}
                onChangeText={field.onChange}
                multiline
                numberOfLines={5}
                placeholder="Describe the property's amenities, nearby landmarks, and specific advantages..."
                textAlignVertical="top"
                style={{
                  minHeight: 128,
                  height: 128,
                  paddingTop: 12,
                  paddingBottom: 12,
                  lineHeight: 22,
                }}
                error={fieldState.error?.message}
              />
            )}
          />
          <View className="flex-row gap-3">
            <Controller
              control={form.control}
              name="bedrooms"
              render={({ field }) => (
                <Counter
                  label="Bedrooms"
                  value={field.value}
                  icon={BedDouble}
                  onChange={field.onChange}
                />
              )}
            />
            <Controller
              control={form.control}
              name="bathrooms"
              render={({ field }) => (
                <Counter
                  label="Bathrooms"
                  value={field.value}
                  icon={Bath}
                  onChange={field.onChange}
                />
              )}
            />
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
                  {(
                    ["FURNISHED", "SEMI_FURNISHED", "UNFURNISHED"] as const
                  ).map((item) => (
                    <Option
                      key={item}
                      label={item.replace("_", " ").toLowerCase()}
                      active={field.value === item}
                      onPress={() => field.onChange(item)}
                    />
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
                <Option
                  label="Available now"
                  active={field.value}
                  onPress={() => field.onChange(true)}
                />
                <Option
                  label="Unavailable"
                  active={!field.value}
                  onPress={() => field.onChange(false)}
                />
              </View>
            )}
          />
          <AddPropertyNote>
            <View className="flex-row items-start gap-3">
              <Info color={colors.primary} size={22} />
              <AppText muted className="min-w-0 flex-1">
                Providing accurate details increases trust. Listings with clear
                descriptions get more enquiries in Accra.
              </AppText>
            </View>
          </AddPropertyNote>
        </View>
      </AddPropertyPanel>
    </AddPropertyShell>
  );
}

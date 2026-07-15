import { zodResolver } from "@hookform/resolvers/zod";
import * as Location from "expo-location";
import { router, type Href } from "expo-router";
import { ArrowLeft, ArrowRight, CalendarDays, Check, ChevronDown, Crosshair, Handshake, Info, Landmark, MapPin, Navigation, RotateCcw, WalletCards } from "lucide-react-native";
import type { ComponentType } from "react";
import { useMemo, useState } from "react";
import { Controller, useForm, type Resolver } from "react-hook-form";
import { Modal, Pressable, ScrollView, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { z } from "zod";
import { AddPropertyNote, AddPropertyPanel, AddPropertyShell } from "@/components/landlord/add-property-shell";
import { PropertyMap } from "@/components/maps/property-map";
import type { PropertyCoordinates } from "@/components/maps/property-map.types";
import { AppButton } from "@/components/ui/app-button";
import { AppInput } from "@/components/ui/app-input";
import { AppText } from "@/components/ui/app-text";
import { colors } from "@/components/ui/design-system";
import { useGhanaLocations } from "@/services/queries/hooks";
import { useLandlordPropertyDraftStore } from "@/store/landlord-property-draft-store";

const OTHER_CITY = "__OTHER_CITY__";

const schema = z
  .object({
    region: z.string().trim().min(2, "Select a region."),
    city: z.string().trim().min(1, "Select a city."),
    otherCity: z.string().trim().optional(),
    area: z.string().trim().min(2, "Enter area."),
    landmark: z.string().trim().optional(),
    address: z.string().trim().min(3, "Enter address."),
    rentAmountCedis: z.coerce.number().min(1, "Enter rent in Ghana cedis."),
    paymentPeriod: z.enum(["MONTHLY", "QUARTERLY", "BIANNUALLY", "YEARLY"]),
    advancePeriodMonths: z.coerce.number().int().min(1),
    isNegotiable: z.boolean(),
    additionalCharges: z.string().trim().optional(),
    availableFrom: z.string().trim().min(1, "Select available month."),
  })
  .refine((value) => value.city !== OTHER_CITY || Boolean(value.otherCity?.trim()), {
    message: "Specify the city.",
    path: ["otherCity"],
  });

type FormValues = z.infer<typeof schema>;

function getNextMonths(count = 12) {
  const now = new Date();
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() + index, 1);
    return {
      value: date.toISOString(),
      label: date.toLocaleDateString("en-GH", { month: "short", year: "numeric" }),
    };
  });
}

function SectionTitle({ icon: Icon, title }: { icon: ComponentType<{ color: string; size: number }>; title: string }) {
  return (
    <View className="mb-4 flex-row items-center gap-2">
      <Icon color={colors.primary} size={22} />
      <AppText variant="title">{title}</AppText>
    </View>
  );
}

function Segment({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable className="h-10 flex-1 items-center justify-center rounded-lg px-2" style={{ backgroundColor: active ? colors.surface : "transparent" }} onPress={onPress}>
      <AppText variant="caption" numberOfLines={1} style={{ color: active ? colors.primary : colors.muted, fontFamily: "Manrope_700Bold" }}>
        {label}
      </AppText>
    </Pressable>
  );
}

function SelectField({
  label,
  value,
  placeholder,
  options,
  onChange,
  error,
}: {
  label: string;
  value?: string;
  placeholder: string;
  options: { label: string; value: string }[];
  onChange: (value: string) => void;
  error?: string;
}) {
  const [open, setOpen] = useState(false);
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const selected = options.find((option) => option.value === value);

  return (
    <View>
      <AppText variant="label" muted className="mb-2 ml-1">
        {label}
      </AppText>
      <Pressable
        className="h-12 flex-row items-center justify-between rounded-xl border px-4"
        style={{ backgroundColor: colors.surface, borderColor: error ? colors.error : colors.borderStrong }}
        onPress={() => setOpen(true)}
      >
        <AppText style={{ color: selected ? colors.text : colors.muted }}>{selected?.label ?? placeholder}</AppText>
        <ChevronDown color={colors.primary} size={18} />
      </Pressable>
      {error ? (
        <AppText variant="caption" className="mt-1 ml-1" style={{ color: colors.error }}>
          {error}
        </AppText>
      ) : null}

      <Modal transparent visible={open} animationType="slide" presentationStyle="overFullScreen" statusBarTranslucent onRequestClose={() => setOpen(false)}>
        <View className="flex-1 justify-end" style={{ backgroundColor: "rgba(0,0,0,0.32)" }}>
          <Pressable className="absolute inset-0" onPress={() => setOpen(false)} />
          <View
            className="rounded-t-3xl p-4"
            style={{
              maxHeight: Math.max(320, height * 0.68),
              paddingBottom: Math.max(insets.bottom, 16),
              backgroundColor: colors.surface,
            }}
          >
            <View className="mb-3 self-center rounded-full" style={{ width: 96, height: 5, backgroundColor: colors.borderStrong }} />
            <AppText variant="title" className="mb-3">
              {label}
            </AppText>
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 8 }}>
              {options.length ? options.map((option) => {
                const active = option.value === value;
                return (
                  <Pressable
                    key={option.value}
                    className="mb-2 flex-row items-center justify-between rounded-2xl p-4"
                    style={{ backgroundColor: active ? colors.surfaceBlue : colors.background }}
                    onPress={() => {
                      onChange(option.value);
                      setOpen(false);
                    }}
                  >
                    <AppText style={{ color: active ? colors.primary : colors.text, fontFamily: active ? "Manrope_700Bold" : "Manrope_400Regular" }}>{option.label}</AppText>
                    {active ? <Check color={colors.primary} size={18} /> : null}
                  </Pressable>
                );
              }) : (
                <View className="rounded-2xl p-4" style={{ backgroundColor: colors.background }}>
                  <AppText muted>{placeholder}</AppText>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

export default function LocationPricingScreen() {
  const { draft, mergeDraft } = useLandlordPropertyDraftStore();
  const locations = useGhanaLocations();
  const monthOptions = useMemo(() => getNextMonths(12), []);
  const [coordinates, setCoordinates] = useState<PropertyCoordinates | null>(() => {
    const latitude = Number(draft.latitude);
    const longitude = Number(draft.longitude);
    return Number.isFinite(latitude) && Number.isFinite(longitude) && draft.latitude && draft.longitude ? { latitude, longitude } : null;
  });
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [mapError, setMapError] = useState(false);
  const [mapKey, setMapKey] = useState(0);
  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
    defaultValues: {
      region: draft.region,
      city: draft.city,
      otherCity: "",
      area: draft.area,
      landmark: draft.landmark ?? "",
      address: draft.address,
      rentAmountCedis: draft.rentAmountCedis,
      paymentPeriod: draft.paymentPeriod as FormValues["paymentPeriod"],
      advancePeriodMonths: draft.advancePeriodMonths,
      isNegotiable: draft.isNegotiable,
      additionalCharges: draft.additionalCharges ?? "",
      availableFrom: draft.availableFrom || monthOptions[0]?.value || "",
    },
  });

  const selectedRegionName = form.watch("region");
  const selectedCity = form.watch("city");
  const regionOptions = (locations.data?.regions ?? []).map((region) => ({ label: region.name, value: region.name }));
  const selectedRegion = locations.data?.regions.find((region) => region.name === selectedRegionName);
  const cityOptions = [
    ...(selectedRegion?.cities ?? []).map((city) => ({ label: city.name, value: city.name })),
    { label: "Other (specify)", value: OTHER_CITY },
  ];

  const onNext = form.handleSubmit((values) => {
    const city = values.city === OTHER_CITY ? values.otherCity?.trim() ?? "" : values.city;
    mergeDraft({
      ...values,
      city,
      latitude: coordinates ? String(coordinates.latitude) : null,
      longitude: coordinates ? String(coordinates.longitude) : null,
    });
    router.push("/landlord/properties/create/review-submit" as Href);
  });

  const handleUseCurrentLocation = async () => {
    setLocating(true);
    setLocationError(null);
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== "granted") {
        setLocationError("Location permission was not granted. You can still move the map manually to the property.");
        return;
      }

      const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setCoordinates({ latitude: position.coords.latitude, longitude: position.coords.longitude });
    } catch {
      setLocationError("FinderZ could not determine your current position. Check location services and try again, or place the pin manually.");
    } finally {
      setLocating(false);
    }
  };

  return (
    <AddPropertyShell
      currentStep={2}
      footer={
        <View className="flex-row gap-3">
          <AppButton title="Back" variant="secondary" icon={<ArrowLeft color={colors.primary} size={18} />} style={{ flex: 1 }} onPress={() => router.back()} />
          <AppButton title="Continue" icon={<ArrowRight color={colors.goldDark} size={18} />} style={{ flex: 1.5 }} onPress={onNext} />
        </View>
      }
    >
      <View className="gap-5">
        <AddPropertyPanel>
          <SectionTitle icon={MapPin} title="Property Location" />
          <View className="gap-4">
            <Controller
              control={form.control}
              name="region"
              render={({ field, fieldState }) => (
                <SelectField
                  label="Region"
                  value={field.value}
                  placeholder={locations.isLoading ? "Loading regions..." : "Select a region"}
                  options={regionOptions}
                  error={fieldState.error?.message}
                  onChange={(value) => {
                    field.onChange(value);
                    form.setValue("city", "");
                    form.setValue("otherCity", "");
                  }}
                />
              )}
            />
            <Controller
              control={form.control}
              name="city"
              render={({ field, fieldState }) => (
                <SelectField
                  label="City"
                  value={field.value}
                  placeholder={selectedRegion ? "Select a city" : "Select a region first"}
                  options={selectedRegion ? cityOptions : []}
                  error={fieldState.error?.message}
                  onChange={field.onChange}
                />
              )}
            />
            {selectedCity === OTHER_CITY ? (
              <Controller control={form.control} name="otherCity" render={({ field, fieldState }) => <AppInput label="Specify City" value={field.value} onChangeText={field.onChange} error={fieldState.error?.message} />} />
            ) : null}
            <Controller control={form.control} name="area" render={({ field, fieldState }) => <AppInput label="Area / Neighborhood" value={field.value} onChangeText={field.onChange} error={fieldState.error?.message} />} />
            <Controller control={form.control} name="landmark" render={({ field }) => <AppInput label="Landmark" value={field.value} onChangeText={field.onChange} left={<Landmark color={colors.outline} size={18} />} />} />
            <Controller control={form.control} name="address" render={({ field, fieldState }) => <AppInput label="Address" value={field.value} onChangeText={field.onChange} error={fieldState.error?.message} left={<Navigation color={colors.outline} size={18} />} />} />

            <View>
              <View className="mb-2 flex-row items-end justify-between gap-3">
                <View className="min-w-0 flex-1">
                  <AppText variant="label" muted>Exact Property Pin</AppText>
                  <AppText variant="caption" muted className="mt-1">Use your location, then move the map until the pin is on the property.</AppText>
                </View>
              </View>

              <View className="mb-3">
                <AppButton
                  title={coordinates ? "Recenter to My Location" : "Use My Current Location"}
                  variant="secondary"
                  loading={locating}
                  icon={<Crosshair color={colors.primary} size={18} />}
                  onPress={() => void handleUseCurrentLocation()}
                />
              </View>

              <PropertyMap
                key={mapKey}
                editable
                coordinates={coordinates}
                onCoordinatesChange={(next) => {
                  setCoordinates(next);
                  setLocationError(null);
                }}
                onMapError={() => setMapError(true)}
              />

              <View className="mt-3 rounded-xl p-3" style={{ backgroundColor: coordinates ? colors.successSoft : colors.warningSoft }}>
                <AppText variant="caption" style={{ color: coordinates ? colors.success : colors.warning, fontFamily: "Manrope_700Bold" }}>
                  {coordinates
                    ? `Pin selected: ${coordinates.latitude.toFixed(6)}, ${coordinates.longitude.toFixed(6)}`
                    : "No exact pin selected yet. A pin is required before approval submission."}
                </AppText>
              </View>

              {locationError ? <AppText variant="caption" className="mt-2" style={{ color: colors.error }}>{locationError}</AppText> : null}
              {mapError ? (
                <Pressable
                  className="mt-2 flex-row items-center gap-2"
                  onPress={() => {
                    setMapError(false);
                    setMapKey((value) => value + 1);
                  }}
                >
                  <RotateCcw color={colors.primary} size={16} />
                  <AppText variant="caption" style={{ color: colors.primary, fontFamily: "Manrope_700Bold" }}>Map failed to load. Retry</AppText>
                </Pressable>
              ) : null}
            </View>
          </View>
        </AddPropertyPanel>

        <AddPropertyPanel>
          <SectionTitle icon={WalletCards} title="Pricing Details" />
          <View className="gap-4">
            <Controller control={form.control} name="rentAmountCedis" render={({ field, fieldState }) => <AppInput label="Price (GH₵)" value={String(field.value || "")} onChangeText={(value) => field.onChange(Number(value) || 0)} keyboardType="decimal-pad" error={fieldState.error?.message} />} />
            <Controller
              control={form.control}
              name="paymentPeriod"
              render={({ field }) => (
                <View>
                  <AppText variant="label" muted className="mb-2 ml-1">
                    Billing Cycle
                  </AppText>
                  <View className="h-12 flex-row rounded-xl p-1" style={{ backgroundColor: colors.surfaceBlue }}>
                    {(["MONTHLY", "QUARTERLY", "BIANNUALLY", "YEARLY"] as const).map((item) => (
                      <Segment key={item} label={item === "BIANNUALLY" ? "6 mo" : item.toLowerCase()} active={field.value === item} onPress={() => field.onChange(item)} />
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
                <Pressable className="flex-row items-center justify-between rounded-2xl p-4" style={{ backgroundColor: colors.surfaceBlue }} onPress={() => field.onChange(!field.value)}>
                  <View className="min-w-0 flex-1 flex-row items-center gap-3">
                    <Handshake color={colors.goldDark} size={24} />
                    <View className="min-w-0 flex-1">
                      <AppText style={{ fontFamily: "Manrope_700Bold" }}>Price is Negotiable</AppText>
                      <AppText variant="caption" muted>Allow potential clients to make offers</AppText>
                    </View>
                  </View>
                  <View className="h-7 w-12 justify-center rounded-full p-1" style={{ backgroundColor: field.value ? colors.primary : colors.borderStrong }}>
                    <View className="h-5 w-5 rounded-full bg-white" style={{ alignSelf: field.value ? "flex-end" : "flex-start" }} />
                  </View>
                </Pressable>
              )}
            />
            <Controller control={form.control} name="additionalCharges" render={({ field }) => <AppInput label="Additional Charges" value={field.value} onChangeText={field.onChange} />} />
            <Controller
              control={form.control}
              name="availableFrom"
              render={({ field, fieldState }) => (
                <View>
                  <View className="mb-2 flex-row items-center gap-2">
                    <CalendarDays color={colors.primary} size={18} />
                    <AppText variant="label" muted>Available Month</AppText>
                  </View>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                    {monthOptions.map((month) => (
                      <Pressable key={month.value} className="rounded-full px-4 py-3" style={{ backgroundColor: field.value === month.value ? colors.primary : colors.surfaceBlue }} onPress={() => field.onChange(month.value)}>
                        <AppText variant="caption" style={{ color: field.value === month.value ? "#fff" : colors.primary, fontFamily: "Manrope_700Bold" }}>{month.label}</AppText>
                      </Pressable>
                    ))}
                  </ScrollView>
                  {fieldState.error?.message ? (
                    <AppText variant="caption" className="mt-1 ml-1" style={{ color: colors.error }}>{fieldState.error.message}</AppText>
                  ) : null}
                </View>
              )}
            />
          </View>
        </AddPropertyPanel>

        <AddPropertyNote>
          <View className="flex-row items-start gap-3">
            <Info color={colors.goldDark} size={22} />
            <AppText className="min-w-0 flex-1" style={{ color: colors.goldDark }}>
              Choose a listed city or select Other to specify your exact city. The full address will be used for location details.
            </AppText>
          </View>
        </AddPropertyNote>
      </View>
    </AddPropertyShell>
  );
}

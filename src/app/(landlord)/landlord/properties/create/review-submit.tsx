import { router, type Href } from "expo-router";
import { ArrowLeft, Check, CheckCircle2, CloudUpload, ImagePlus, ShieldCheck, X } from "lucide-react-native";
import { useRef, useState } from "react";
import { Alert, Image, Pressable, View } from "react-native";
import FileUpload, { type UploadedFileResult } from "@/components/general/file-upload";
import { AddPropertyPanel, AddPropertyShell } from "@/components/landlord/add-property-shell";
import { AppButton } from "@/components/ui/app-button";
import { AppInput } from "@/components/ui/app-input";
import { AppText } from "@/components/ui/app-text";
import { Checkbox } from "@/components/ui/checkbox";
import { colors } from "@/components/ui/design-system";
import { getErrorMessage } from "@/lib/get-error-message";
import { useSaveLandlordProperty } from "@/services/queries/hooks";
import { useLandlordPropertyDraftStore } from "@/store/landlord-property-draft-store";

const amenityOptions = [
  "Air Conditioning",
  "High-speed WiFi",
  "Water Reservoir (Polytank)",
  "24/7 Security",
  "Secured Parking",
  "Backup Generator",
];

function AmenityRow({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable className="flex-row items-center gap-3 rounded-2xl p-4" style={{ backgroundColor: active ? "#dce9ff" : colors.surfaceBlue }} onPress={onPress}>
      <View className="h-6 w-6 items-center justify-center rounded-md border" style={{ backgroundColor: active ? colors.primary : colors.surface, borderColor: active ? colors.primary : colors.borderStrong }}>
        {active ? <Check color="#fff" size={15} /> : null}
      </View>
      <AppText className="min-w-0 flex-1" style={{ fontFamily: "Manrope_700Bold" }}>
        {label}
      </AppText>
    </Pressable>
  );
}

export default function ReviewSubmitScreen() {
  const { draft, mergeDraft, resetDraft } = useLandlordPropertyDraftStore();
  const save = useSaveLandlordProperty();
  const submissionIdRef = useRef(draft.submissionId ?? crypto.randomUUID());
  const submittingRef = useRef(false);
  const [amenities, setAmenities] = useState(draft.amenities);
  const [images, setImages] = useState<UploadedFileResult[]>(
    draft.images.map((image, index) => ({
      name: `Property image ${index + 1}`,
      uri: image.imageUrl,
      upload: {
        previewUrl: image.imageUrl,
        public_id: image.publicId ?? "",
        secure_url: image.imageUrl,
        url: image.imageUrl,
      },
    })),
  );
  const [coverUri, setCoverUri] = useState(draft.images.find((image) => image.isCover)?.imageUrl ?? draft.images[0]?.imageUrl ?? "");
  const [contactPreferences, setContactPreferences] = useState(draft.contactPreferences ?? "PHONE");
  const [inspectionAvailability, setInspectionAvailability] = useState(draft.inspectionAvailability ?? "");
  const [houseRules, setHouseRules] = useState(draft.houseRules ?? "");
  const [confirmed, setConfirmed] = useState(false);

  const toggleAmenity = (amenity: string) => {
    setAmenities((current) => (current.includes(amenity) ? current.filter((item) => item !== amenity) : [...current, amenity]));
  };

  const removeImage = (uri: string) => {
    const next = images.filter((image) => image.uri !== uri);
    setImages(next);
    if (coverUri === uri) {
      setCoverUri(next[0]?.uri ?? "");
    }
  };

  const currentDraft = () => ({
    ...draft,
    submissionId: submissionIdRef.current,
    amenities,
    images: images
      .filter((file) => file.upload)
      .map((file, index) => ({
        imageUrl: file.upload!.secure_url,
        publicId: file.upload!.public_id,
        position: index,
        isCover: (coverUri || images[0]?.uri) === file.uri || (coverUri || images[0]?.upload?.secure_url) === file.upload!.secure_url,
      })),
    contactPreferences,
    inspectionAvailability,
    houseRules,
  });

  const persist = async (submitForApproval: boolean) => {
    if (submittingRef.current) return;

    const payload = currentDraft();
    mergeDraft(payload);

    if (submitForApproval && payload.images.length === 0) {
      Alert.alert("Property photos required", "Upload at least one property photo before submitting for approval.");
      return;
    }

    if (submitForApproval && (!payload.latitude || !payload.longitude)) {
      Alert.alert("Property pin required", "Go back to Location & Pricing and select the property's exact position on the map before submitting for approval.");
      return;
    }

    if (submitForApproval && !confirmed) {
      Alert.alert("Confirmation required", "Confirm that the listing information is accurate before submitting.");
      return;
    }

    try {
      submittingRef.current = true;
      await save.mutateAsync({ ...payload, submitForApproval });
      resetDraft();
      router.replace(submitForApproval ? ("/landlord/property-submitted" as Href) : ("/landlord/properties" as Href));
    } catch (error) {
      Alert.alert("Unable to save property", getErrorMessage(error, "Please check the property details and try again."));
    } finally {
      submittingRef.current = false;
    }
  };

  return (
    <AddPropertyShell
      currentStep={3}
      footer={
        <View className="flex-row gap-3">
          <AppButton title="Back" variant="secondary" icon={<ArrowLeft color={colors.primary} size={18} />} style={{ flex: 1 }} onPress={() => router.back()} />
          <AppButton title="Submit for Approval" loading={save.isPending} icon={<ShieldCheck color={colors.goldDark} size={18} />} style={{ flex: 2 }} onPress={() => void persist(true)} />
        </View>
      }
    >
      <View className="gap-7">
        <View>
          <View className="mb-3 flex-row items-center gap-2">
            <ImagePlus color={colors.primary} size={22} />
            <AppText variant="title">Property Photos</AppText>
          </View>
          <AppText muted className="mb-4">
            Upload high-quality photos. Listings with better images get more enquiries in Ghana.
          </AppText>

          <FileUpload
            label="Add Photo"
            helperText="Upload property images"
            mode="image"
            uploadMode="multi"
            purpose="propertyImage"
            value={images}
            onChange={(files) => {
              setImages(files);
              if (!coverUri && files[0]) setCoverUri(files[0].uri);
            }}
          />

          <View className="mt-4 flex-row flex-wrap gap-3">
            {images.map((file, index) => {
              const imageUri = file.upload?.secure_url ?? file.uri;
              const active = coverUri === file.uri || coverUri === imageUri;
              return (
                <Pressable key={file.uri} className="overflow-hidden rounded-2xl border" style={{ width: "47%", aspectRatio: 4 / 3, borderColor: active ? colors.primary : colors.border }} onPress={() => setCoverUri(file.uri)}>
                  <Image source={{ uri: imageUri }} resizeMode="cover" style={{ width: "100%", height: "100%" }} />
                  {active ? (
                    <View className="absolute bottom-2 left-2 rounded-full px-2 py-1" style={{ backgroundColor: colors.gold }}>
                      <AppText variant="caption" style={{ color: colors.goldDark, fontFamily: "Manrope_700Bold" }}>Cover</AppText>
                    </View>
                  ) : null}
                  <Pressable className="absolute right-2 top-2 h-8 w-8 items-center justify-center rounded-full" style={{ backgroundColor: colors.error }} onPress={() => removeImage(file.uri)}>
                    <X color="#fff" size={16} />
                  </Pressable>
                </Pressable>
              );
            })}
            {!images.length ? (
              <View className="w-full items-center justify-center rounded-2xl border border-dashed p-6" style={{ borderColor: colors.borderStrong, backgroundColor: colors.surfaceBlue }}>
                <CloudUpload color={colors.primary} size={28} />
                <AppText className="mt-2" style={{ color: colors.primary, fontFamily: "Manrope_700Bold" }}>Photos appear here</AppText>
              </View>
            ) : null}
          </View>
        </View>

        <View>
          <View className="mb-3 flex-row items-center gap-2">
            <CheckCircle2 color={colors.primary} size={22} />
            <AppText variant="title">Amenities</AppText>
          </View>
          <View className="gap-3">
            {amenityOptions.map((amenity) => (
              <AmenityRow key={amenity} label={amenity} active={amenities.includes(amenity)} onPress={() => toggleAmenity(amenity)} />
            ))}
          </View>
        </View>

        <AddPropertyPanel>
          <AppText variant="title">Listing Summary</AppText>
          <View className="mt-4 gap-3">
            <View className="flex-row justify-between gap-3">
              <AppText muted>Property Type:</AppText>
              <AppText style={{ fontFamily: "Manrope_700Bold" }}>{draft.propertyType.replace("_", " ")}</AppText>
            </View>
            <View className="flex-row justify-between gap-3">
              <AppText muted>Location:</AppText>
              <AppText className="min-w-0 flex-1 text-right" style={{ fontFamily: "Manrope_700Bold" }}>{draft.area || "Area"}, {draft.city || "City"}</AppText>
            </View>
            <View className="flex-row justify-between gap-3">
              <AppText muted>Map Pin:</AppText>
              <AppText className="min-w-0 flex-1 text-right" style={{ color: draft.latitude && draft.longitude ? colors.success : colors.warning, fontFamily: "Manrope_700Bold" }}>
                {draft.latitude && draft.longitude ? "Exact location selected" : "Required before submission"}
              </AppText>
            </View>
            <View className="flex-row justify-between gap-3">
              <AppText muted>Price:</AppText>
              <AppText style={{ color: colors.primary, fontFamily: "Manrope_800ExtraBold" }}>GHS {Number(draft.rentAmountCedis || 0).toLocaleString("en-GH")} / {draft.paymentPeriod.toLowerCase()}</AppText>
            </View>
          </View>
        </AddPropertyPanel>

        <View className="gap-4">
          <AppInput label="Contact Preferences" value={contactPreferences} onChangeText={setContactPreferences} />
          <AppInput label="Inspection Availability" value={inspectionAvailability} onChangeText={setInspectionAvailability} />
          <AppInput label="House Rules" value={houseRules} onChangeText={setHouseRules} multiline style={{ minHeight: 84, textAlignVertical: "top", paddingVertical: 12 }} />
        </View>

        <View className="rounded-2xl p-4" style={{ backgroundColor: colors.surfaceBlue }}>
          <Checkbox
            checked={confirmed}
            onChange={setConfirmed}
            label={
              <AppText muted className="min-w-0 flex-1">
                I confirm that the information provided is accurate and I have the legal right to list this property.
              </AppText>
            }
          />
        </View>

        <AppButton title="Save as Draft" variant="secondary" loading={save.isPending} onPress={() => void persist(false)} />
      </View>
    </AddPropertyShell>
  );
}

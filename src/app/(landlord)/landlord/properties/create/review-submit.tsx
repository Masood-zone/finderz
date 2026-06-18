import { router, type Href } from "expo-router";
import { CheckCircle2 } from "lucide-react-native";
import { useState } from "react";
import { Alert, Pressable, ScrollView, View } from "react-native";
import FileUpload, { type UploadedFileResult } from "@/components/general/file-upload";
import { AppButton } from "@/components/ui/app-button";
import { AppInput } from "@/components/ui/app-input";
import { AppText } from "@/components/ui/app-text";
import { colors } from "@/components/ui/design-system";
import { ScreenShell } from "@/components/ui/screen-shell";
import { LandlordCard } from "@/components/landlord/landlord-shell";
import { getErrorMessage } from "@/lib/get-error-message";
import { useLandlordPropertyDraftStore } from "@/store/landlord-property-draft-store";
import { useSaveLandlordProperty } from "@/services/queries/hooks";

const amenityOptions = ["Air conditioning", "Reliable water supply", "Parking", "Security", "Wi-Fi", "Backup generator", "Kitchen", "Balcony"];

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable className="flex-row items-center gap-2 rounded-full px-4 py-3" style={{ backgroundColor: active ? colors.primary : colors.surfaceBlue }} onPress={onPress}>
      {active ? <CheckCircle2 color="#fff" size={14} /> : null}
      <AppText variant="caption" style={{ color: active ? "#fff" : colors.primary, fontFamily: "Manrope_700Bold" }}>
        {label}
      </AppText>
    </Pressable>
  );
}

export default function ReviewSubmitScreen() {
  const { draft, mergeDraft, resetDraft } = useLandlordPropertyDraftStore();
  const save = useSaveLandlordProperty();
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

  const toggleAmenity = (amenity: string) => {
    setAmenities((current) => (current.includes(amenity) ? current.filter((item) => item !== amenity) : [...current, amenity]));
  };

  const currentDraft = () => ({
    ...draft,
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
    const payload = currentDraft();
    mergeDraft(payload);

    if (submitForApproval && payload.images.length === 0) {
      Alert.alert("Property images required", "Upload at least one property image before submitting for approval.");
      return;
    }

    try {
      await save.mutateAsync({ ...payload, submitForApproval });
      resetDraft();
      if (submitForApproval) {
        router.replace("/landlord/property-submitted" as Href);
      } else {
        router.replace("/landlord/properties" as Href);
      }
    } catch (error) {
      Alert.alert("Unable to save property", getErrorMessage(error, "Please check the property details and try again."));
    }
  };

  const missingBasics = !draft.title || !draft.region || !draft.rentAmountCedis;

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <ScreenShell title="Add Property" subtitle="Final Step" showBack>
        <ScrollView contentContainerStyle={{ paddingTop: 20, paddingBottom: 90, gap: 18 }} showsVerticalScrollIndicator={false}>
          <View>
            <AppText variant="label" muted className="mb-2 ml-1">
              Amenities
            </AppText>
            <View className="flex-row flex-wrap gap-2">
              {amenityOptions.map((amenity) => (
                <Chip key={amenity} label={amenity} active={amenities.includes(amenity)} onPress={() => toggleAmenity(amenity)} />
              ))}
            </View>
          </View>

          <FileUpload label="Property Images" helperText="Upload clear photos. Select the cover below." mode="image" uploadMode="multi" purpose="propertyImage" value={images} onChange={(files) => {
            setImages(files);
            if (!coverUri && files[0]) setCoverUri(files[0].uri);
          }} />

          {images.length ? (
            <View>
              <AppText variant="label" muted className="mb-2 ml-1">
                Cover Image
              </AppText>
              <View className="flex-row flex-wrap gap-2">
                {images.map((file, index) => (
                  <Chip key={file.uri} label={`Image ${index + 1}`} active={coverUri === file.uri || coverUri === file.upload?.secure_url} onPress={() => setCoverUri(file.uri)} />
                ))}
              </View>
            </View>
          ) : null}

          <AppInput label="Contact Preferences" value={contactPreferences} onChangeText={setContactPreferences} />
          <AppInput label="Inspection Availability" value={inspectionAvailability} onChangeText={setInspectionAvailability} />
          <AppInput label="House Rules" value={houseRules} onChangeText={setHouseRules} multiline style={{ minHeight: 84, textAlignVertical: "top", paddingVertical: 12 }} />

          <LandlordCard>
            <AppText variant="title">Review Summary</AppText>
            <AppText muted className="mt-2">
              {draft.title || "Untitled property"} in {draft.area || "area"}, {draft.city || "city"}
            </AppText>
            <AppText className="mt-2" style={{ color: colors.primary, fontFamily: "Manrope_800ExtraBold" }}>
              GH₵{Number(draft.rentAmountCedis || 0).toLocaleString("en-GH")} / {draft.paymentPeriod.toLowerCase()}
            </AppText>
            <AppText variant="caption" muted className="mt-2">
              Submission status will become PENDING. Approval remains an administrator action.
            </AppText>
          </LandlordCard>

          {missingBasics ? (
            <AppButton title="Complete Previous Steps" variant="secondary" onPress={() => router.replace("/landlord/properties/create/basics" as Href)} />
          ) : (
            <View className="gap-3">
              <AppButton title="Save Draft" variant="secondary" loading={save.isPending} onPress={() => void persist(false)} />
              <AppButton title="Submit for Approval" loading={save.isPending} onPress={() => void persist(true)} />
            </View>
          )}
        </ScrollView>
      </ScreenShell>
    </View>
  );
}

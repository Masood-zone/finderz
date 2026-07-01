import { zodResolver } from "@hookform/resolvers/zod";
import { router, type Href } from "expo-router";
import { Controller, useForm, type Resolver } from "react-hook-form";
import { z } from "zod";
import { Pressable, ScrollView, View } from "react-native";
import FileUpload, { type UploadedFileResult } from "@/components/general/file-upload";
import { AppButton } from "@/components/ui/app-button";
import { AppInput } from "@/components/ui/app-input";
import { AppText } from "@/components/ui/app-text";
import { colors } from "@/components/ui/design-system";
import { FormError } from "@/components/ui/form-error";
import { ScreenShell } from "@/components/ui/screen-shell";
import { getErrorMessage } from "@/lib/get-error-message";
import { useLandlordProfile, useSubmitLandlordOnboarding } from "@/services/queries/hooks";
import { useState } from "react";

const schema = z
  .object({
    legalName: z.string().trim().min(2, "Enter your legal name."),
    phone: z.string().trim().min(7, "Enter a valid phone number."),
    landlordType: z.enum(["INDIVIDUAL", "AGENCY"]),
    agencyName: z.string().trim().optional(),
    address: z.string().trim().min(3, "Enter your address."),
    preferredContactMethod: z.enum(["PHONE", "WHATSAPP", "EMAIL", "IN_APP"]),
    identityDocumentType: z.enum(["Ghana Card", "Health Insurance Card", "Voters ID", "Driver's License"]),
    profileFiles: z.array(z.custom<UploadedFileResult>()).default([]),
    identityFiles: z.array(z.custom<UploadedFileResult>()).min(1, "Upload a government accepted ID."),
  })
  .refine((value) => value.landlordType !== "AGENCY" || Boolean(value.agencyName?.trim()), {
    message: "Enter your agency name.",
    path: ["agencyName"],
  });

type FormValues = z.infer<typeof schema>;

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable className="rounded-full px-4 py-3" style={{ backgroundColor: active ? colors.primary : colors.surfaceBlue }} onPress={onPress}>
      <AppText variant="caption" style={{ color: active ? "#fff" : colors.primary, fontFamily: "Manrope_700Bold" }}>
        {label}
      </AppText>
    </Pressable>
  );
}

export default function LandlordOnboardingScreen() {
  const profile = useLandlordProfile();
  const submit = useSubmitLandlordOnboarding();
  const [submitError, setSubmitError] = useState<string | undefined>();
  const existing = profile.data?.profile;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
    values: {
      legalName: existing?.legalName ?? profile.data?.user.name ?? "",
      phone: profile.data?.user.phone ?? "",
      landlordType: existing?.landlordType ?? "INDIVIDUAL",
      agencyName: existing?.agencyName ?? "",
      address: existing?.address ?? "",
      preferredContactMethod: existing?.preferredContactMethod ?? "PHONE",
      identityDocumentType: (existing?.identityDocumentType as FormValues["identityDocumentType"]) ?? "Ghana Card",
      profileFiles: [],
      identityFiles: [],
    },
  });

  const landlordType = form.watch("landlordType");

  const onSubmit = form.handleSubmit(async (values) => {
    setSubmitError(undefined);
    const identity = values.identityFiles[0]?.upload;
    if (!identity) {
      form.setError("identityFiles", { message: "Upload a government accepted ID." });
      return;
    }

    try {
      await submit.mutateAsync({
        legalName: values.legalName,
        phone: values.phone,
        profileImage: values.profileFiles[0]?.upload
          ? {
              secureUrl: values.profileFiles[0].upload.secure_url,
              publicId: values.profileFiles[0].upload.public_id,
            }
          : null,
        landlordType: values.landlordType,
        agencyName: values.agencyName,
        address: values.address,
        preferredContactMethod: values.preferredContactMethod,
        identityDocumentType: values.identityDocumentType,
        identityDocument: {
          secureUrl: identity.secure_url,
          publicId: identity.public_id,
        },
      });
      router.replace("/landlord/verification-status" as Href);
    } catch (error) {
      setSubmitError(getErrorMessage(error, "Unable to submit onboarding. Please try again."));
    }
  });

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <ScreenShell title="Landlord Onboarding" subtitle="Submit your details for review" showBack>
        <ScrollView contentContainerStyle={{ paddingTop: 20, paddingBottom: 80, gap: 18 }} showsVerticalScrollIndicator={false}>
          {existing ? (
            <View className="rounded-2xl border p-4" style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
              <AppText variant="label" muted>
                Current Review Status
              </AppText>
              <AppText className="mt-1" style={{ fontFamily: "Manrope_700Bold", color: colors.primary }}>
                {existing.verificationStatus.replaceAll("_", " ")}
              </AppText>
              {existing.verificationNotes ? (
                <AppText className="mt-2" style={{ color: colors.warning }}>
                  {existing.verificationNotes}
                </AppText>
              ) : null}
              {existing.identityDocumentUrl ? (
                <AppText className="mt-2" muted>
                  A document is already on file. Upload a new one to resubmit your verification.
                </AppText>
              ) : null}
            </View>
          ) : null}

          <Controller control={form.control} name="legalName" render={({ field, fieldState }) => <AppInput label="Legal Name" value={field.value} onChangeText={field.onChange} error={fieldState.error?.message} />} />
          <Controller control={form.control} name="phone" render={({ field, fieldState }) => <AppInput label="Phone" value={field.value} onChangeText={field.onChange} keyboardType="phone-pad" error={fieldState.error?.message} />} />

          <Controller
            control={form.control}
            name="profileFiles"
            render={({ field }) => (
              <FileUpload label="Profile Image" helperText="Optional profile photo" mode="image" purpose="userProfile" value={field.value} onChange={field.onChange} />
            )}
          />

          <View>
            <AppText variant="label" muted className="mb-2 ml-1">
              Landlord Type
            </AppText>
            <View className="flex-row gap-2">
              <Chip label="Landlord" active={landlordType === "INDIVIDUAL"} onPress={() => form.setValue("landlordType", "INDIVIDUAL")} />
              <Chip label="Agent / Agency" active={landlordType === "AGENCY"} onPress={() => form.setValue("landlordType", "AGENCY")} />
            </View>
          </View>

          {landlordType === "AGENCY" ? (
            <Controller control={form.control} name="agencyName" render={({ field, fieldState }) => <AppInput label="Agency Name" value={field.value} onChangeText={field.onChange} error={fieldState.error?.message} />} />
          ) : null}

          <Controller control={form.control} name="address" render={({ field, fieldState }) => <AppInput label="Address" value={field.value} onChangeText={field.onChange} error={fieldState.error?.message} />} />

          <Controller
            control={form.control}
            name="preferredContactMethod"
            render={({ field }) => (
              <View>
                <AppText variant="label" muted className="mb-2 ml-1">
                  Preferred Contact
                </AppText>
                <View className="flex-row flex-wrap gap-2">
                  {(["PHONE", "WHATSAPP", "EMAIL", "IN_APP"] as const).map((item) => (
                    <Chip key={item} label={item.replace("_", " ")} active={field.value === item} onPress={() => field.onChange(item)} />
                  ))}
                </View>
              </View>
            )}
          />

          <Controller
            control={form.control}
            name="identityDocumentType"
            render={({ field }) => (
              <View>
                <AppText variant="label" muted className="mb-2 ml-1">
                  Identity Document
                </AppText>
                <View className="flex-row flex-wrap gap-2">
                  {(["Ghana Card", "Health Insurance Card", "Voters ID", "Driver's License"] as const).map((item) => (
                    <Chip key={item} label={item} active={field.value === item} onPress={() => field.onChange(item)} />
                  ))}
                </View>
              </View>
            )}
          />

          <Controller
            control={form.control}
            name="identityFiles"
            render={({ field, fieldState }) => (
              <View>
                <FileUpload label="Identity Document Upload" helperText="Ghana Card, NHIS, Voter ID or Driver's License" mode="document" purpose="landlordIdentity" value={field.value} onChange={field.onChange} />
                {fieldState.error?.message ? (
                  <AppText variant="caption" className="mt-2" style={{ color: colors.error }}>
                    {fieldState.error.message}
                  </AppText>
                ) : null}
              </View>
            )}
          />

          <FormError message={submitError} title="Onboarding submission failed" />

          <AppButton title={existing ? "Resubmit for Review" : "Submit for Review"} loading={submit.isPending} onPress={onSubmit} />
        </ScrollView>
      </ScreenShell>
    </View>
  );
}

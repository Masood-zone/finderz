import { zodResolver } from "@hookform/resolvers/zod";
import { router, type Href } from "expo-router";
import { Controller, useForm, type Resolver } from "react-hook-form";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { z } from "zod";
import FileUpload, { type UploadedFileResult } from "@/components/general/file-upload";
import { LoadingScreen } from "@/components/shared/loading-screen";
import { AppButton } from "@/components/ui/app-button";
import { AppInput } from "@/components/ui/app-input";
import { AppText } from "@/components/ui/app-text";
import { colors } from "@/components/ui/design-system";
import { FormError } from "@/components/ui/form-error";
import { PasswordInput } from "@/components/ui/password-input";
import { getErrorMessage } from "@/lib/get-error-message";
import { fullNameSchema } from "@/lib/validation/full-name";
import { useChangePassword, useCurrentUser, useUpdateProfile } from "@/services/queries/hooks";

const accountEditorSchema = z
  .object({
    name: fullNameSchema,
    phone: z.string().trim().max(30, "Use 30 characters or fewer.").optional(),
    profileFiles: z.array(z.custom<UploadedFileResult>()).default([]),
    currentPassword: z.string().optional(),
    newPassword: z.string().optional(),
    confirmPassword: z.string().optional(),
  })
  .superRefine((value, context) => {
    const wantsPasswordChange = Boolean(value.currentPassword || value.newPassword || value.confirmPassword);

    if (!wantsPasswordChange) {
      return;
    }

    if (!value.currentPassword?.trim()) {
      context.addIssue({
        code: "custom",
        message: "Enter your current password.",
        path: ["currentPassword"],
      });
    }

    if (!value.newPassword?.trim()) {
      context.addIssue({
        code: "custom",
        message: "Enter a new password.",
        path: ["newPassword"],
      });
    } else if (value.newPassword.trim().length < 8) {
      context.addIssue({
        code: "custom",
        message: "Use at least 8 characters.",
        path: ["newPassword"],
      });
    }

    if (!value.confirmPassword?.trim()) {
      context.addIssue({
        code: "custom",
        message: "Confirm your new password.",
        path: ["confirmPassword"],
      });
    } else if (value.newPassword?.trim() !== value.confirmPassword.trim()) {
      context.addIssue({
        code: "custom",
        message: "Passwords do not match.",
        path: ["confirmPassword"],
      });
    }
  });

type AccountEditorValues = z.infer<typeof accountEditorSchema>;

function toUploadValue(image: string | null | undefined): UploadedFileResult[] {
  if (!image) {
    return [];
  }

  const name = image.split("/").pop() || "profile-image.jpg";
  return [{ name, uri: image, type: "image/jpeg" }];
}

export function AccountEditorForm({
  fallbackHref,
}: {
  fallbackHref: Href;
}) {
  const currentUser = useCurrentUser();
  const updateProfileMutation = useUpdateProfile();
  const changePasswordMutation = useChangePassword();
  const [submitError, setSubmitError] = useState<string | undefined>();
  const [submitMessage, setSubmitMessage] = useState<string | undefined>();

  const form = useForm<AccountEditorValues>({
    resolver: zodResolver(accountEditorSchema) as Resolver<AccountEditorValues>,
    defaultValues: {
      name: "",
      phone: "",
      profileFiles: [],
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (!currentUser.data?.user) {
      return;
    }

    form.reset({
      name: currentUser.data.user.name,
      phone: currentUser.data.user.phone ?? "",
      profileFiles: toUploadValue(currentUser.data.user.image),
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  }, [currentUser.data?.user, form]);

  if (currentUser.isLoading) {
    return <LoadingScreen label="Loading your profile" />;
  }

  if (currentUser.isError || !currentUser.data?.user) {
    return (
      <View className="gap-4">
        <FormError title="Profile unavailable" message={getErrorMessage(currentUser.error, "Your profile could not be loaded.")} />
        <AppButton title="Try Again" variant="secondary" onPress={() => void currentUser.refetch()} />
      </View>
    );
  }

  const user = currentUser.data.user;

  const onSubmit = form.handleSubmit(async (values) => {
    setSubmitError(undefined);
    setSubmitMessage(undefined);

    const trimmedName = values.name.trim();
    const trimmedPhone = values.phone?.trim() || "";
    const nextPhone = trimmedPhone ? trimmedPhone : null;
    const currentPhone = user.phone ?? null;

    const nextImage =
      values.profileFiles[0]?.upload?.secure_url ??
      (values.profileFiles[0]?.uri === user.image ? user.image : null);
    const currentImage = user.image ?? null;

    const profileChanged = trimmedName !== user.name || nextPhone !== currentPhone || nextImage !== currentImage;
    const wantsPasswordChange = Boolean(values.currentPassword || values.newPassword || values.confirmPassword);

    if (!profileChanged && !wantsPasswordChange) {
      setSubmitMessage("No changes to save.");
      return;
    }

    try {
      if (profileChanged) {
        await updateProfileMutation.mutateAsync({
          name: trimmedName,
          phone: nextPhone,
          image: nextImage,
        });
      }

      if (wantsPasswordChange) {
        await changePasswordMutation.mutateAsync({
          currentPassword: values.currentPassword!.trim(),
          newPassword: values.newPassword!.trim(),
        });
      }

      form.reset({
        name: trimmedName,
        phone: nextPhone ?? "",
        profileFiles: toUploadValue(nextImage),
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setSubmitMessage(wantsPasswordChange ? "Profile and password updated successfully." : "Profile updated successfully.");

      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace(fallbackHref);
      }
    } catch (error) {
      setSubmitError(getErrorMessage(error, "Unable to update your profile right now."));
    }
  });

  const loading = updateProfileMutation.isPending || changePasswordMutation.isPending;

  return (
    <View className="gap-5">
      <View>
        <AppText variant="title">Profile Details</AppText>
        <AppText muted className="mt-1">
          Update your photo, display name, and contact details.
        </AppText>
      </View>

      <Controller
        control={form.control}
        name="profileFiles"
        render={({ field }) => (
          <FileUpload
            label="Profile Image"
            helperText="Upload a clear profile photo."
            mode="image"
            purpose="userProfile"
            value={field.value}
            onChange={field.onChange}
          />
        )}
      />

      <Controller
        control={form.control}
        name="name"
        render={({ field, fieldState }) => (
          <AppInput
            label="Full Name"
            value={field.value}
            onChangeText={field.onChange}
            error={fieldState.error?.message}
          />
        )}
      />

      <AppInput label="Email" value={user.email} editable={false} />

      <Controller
        control={form.control}
        name="phone"
        render={({ field, fieldState }) => (
          <AppInput
            label="Phone"
            value={field.value ?? ""}
            onChangeText={field.onChange}
            keyboardType="phone-pad"
            error={fieldState.error?.message}
          />
        )}
      />

      <View className="gap-2 rounded-2xl border p-4" style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
        <AppText variant="title">Change Password</AppText>
        <AppText muted>
          Leave these fields blank if you do not want to change your password.
        </AppText>

        <Controller
          control={form.control}
          name="currentPassword"
          render={({ field, fieldState }) => (
            <PasswordInput
              label="Current Password"
              value={field.value ?? ""}
              onChangeText={field.onChange}
              error={fieldState.error?.message}
              textContentType="password"
            />
          )}
        />

        <Controller
          control={form.control}
          name="newPassword"
          render={({ field, fieldState }) => (
            <PasswordInput
              label="New Password"
              value={field.value ?? ""}
              onChangeText={field.onChange}
              error={fieldState.error?.message}
              textContentType="newPassword"
            />
          )}
        />

        <Controller
          control={form.control}
          name="confirmPassword"
          render={({ field, fieldState }) => (
            <PasswordInput
              label="Confirm New Password"
              value={field.value ?? ""}
              onChangeText={field.onChange}
              error={fieldState.error?.message}
              textContentType="password"
            />
          )}
        />
      </View>

      {submitMessage ? <FormError message={submitMessage} tone="info" /> : null}
      <FormError message={submitError} title="Profile update failed" />

      <AppButton title="Save Changes" loading={loading} onPress={onSubmit} />
    </View>
  );
}

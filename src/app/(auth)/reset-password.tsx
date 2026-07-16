import { zodResolver } from "@hookform/resolvers/zod";
import { router, useLocalSearchParams } from "expo-router";
import { LockKeyhole } from "lucide-react-native";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { View } from "react-native";
import { z } from "zod";
import { AppButton } from "@/components/ui/app-button";
import { AppText } from "@/components/ui/app-text";
import { colors, radius } from "@/components/ui/design-system";
import { FormError } from "@/components/ui/form-error";
import { KeyboardAwareScreen } from "@/components/ui/keyboard-aware-screen";
import { PasswordInput } from "@/components/ui/password-input";
import { ScreenShell } from "@/components/ui/screen-shell";
import { getErrorMessage } from "@/lib/get-error-message";
import { resetPasswordWithToken } from "@/services/api/auth-flows";

const resetSchema = z.object({
  password: z.string().min(8, "Use at least 8 characters.").max(128, "Password must be 128 characters or fewer."),
  confirmPassword: z.string().min(1, "Confirm your new password."),
}).refine((values) => values.password === values.confirmPassword, { path: ["confirmPassword"], message: "Passwords do not match." });

type ResetFormValues = z.infer<typeof resetSchema>;

export default function ResetPasswordScreen() {
  const params = useLocalSearchParams<{ token?: string }>();
  const token = typeof params.token === "string" ? params.token : "";
  const [error, setError] = useState<string | undefined>();
  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema as never),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const onSubmit = handleSubmit(async ({ password }) => {
    setError(undefined);
    if (!token) {
      setError("This reset session is invalid. Request a new verification code.");
      return;
    }

    try {
      await resetPasswordWithToken(password, token);
      router.replace({ pathname: "/sign-in", params: { passwordReset: "success" } });
    } catch (resetError) {
      setError(getErrorMessage(resetError, "Unable to reset your password. The reset session may have expired."));
    }
  });

  return (
    <KeyboardAwareScreen>
      <ScreenShell>
        <View className="mt-8 items-center">
          <View className="h-28 w-28 items-center justify-center" style={{ borderRadius: radius.xxl, backgroundColor: colors.surfaceBlue }}>
            <LockKeyhole color={colors.primary} size={52} />
          </View>
        </View>
        <View className="mt-8">
          <AppText variant="display">Create a new password</AppText>
          <AppText muted className="mt-3">Use at least eight characters. All other FinderZ sessions will be signed out after the reset.</AppText>
        </View>
        <View className="mt-8 gap-4">
          <Controller control={control} name="password" render={({ field: { onChange, onBlur, value } }) => (
            <PasswordInput label="New Password" placeholder="Enter a new password" textContentType="newPassword" autoComplete="new-password" value={value} onBlur={onBlur} onChangeText={onChange} error={errors.password?.message} />
          )} />
          <Controller control={control} name="confirmPassword" render={({ field: { onChange, onBlur, value } }) => (
            <PasswordInput label="Confirm New Password" placeholder="Enter it again" textContentType="newPassword" autoComplete="new-password" value={value} onBlur={onBlur} onChangeText={onChange} error={errors.confirmPassword?.message} />
          )} />
          <FormError message={error} />
          <AppButton title="Reset Password" loading={isSubmitting} onPress={onSubmit} />
        </View>
      </ScreenShell>
    </KeyboardAwareScreen>
  );
}

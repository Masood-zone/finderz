import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "expo-router";
import { Mail, ShieldCheck } from "lucide-react-native";
import { Pressable, View } from "react-native";
import { z } from "zod";
import { AppButton } from "@/components/ui/app-button";
import { AppInput } from "@/components/ui/app-input";
import { AppText } from "@/components/ui/app-text";
import { colors, radius } from "@/components/ui/design-system";
import { FormError } from "@/components/ui/form-error";
import { KeyboardAwareScreen } from "@/components/ui/keyboard-aware-screen";
import { ScreenShell } from "@/components/ui/screen-shell";
import { getErrorMessage } from "@/lib/get-error-message";
import { requestPasswordResetEmail } from "@/services/api/auth-flows";

const forgotPasswordSchema = z.object({
  email: z.email("Enter a valid email address."),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordScreen() {
  const [message, setMessage] = useState<string | undefined>();
  const [error, setError] = useState<string | undefined>();
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema as never),
    defaultValues: { email: "" },
  });

  const onSubmit = handleSubmit(async ({ email }) => {
    setMessage(undefined);
    setError(undefined);

    try {
      await requestPasswordResetEmail(email.trim());
      setMessage("If that email exists, FinderZ will send password reset instructions.");
    } catch (resetError) {
      setError(
        getErrorMessage(resetError, "Password reset email delivery is not configured yet."),
      );
    }
  });

  return (
    <KeyboardAwareScreen>
      <ScreenShell showBack>
        <View className="mt-8 items-center">
          <View className="h-28 w-28 items-center justify-center" style={{ borderRadius: radius.xxl, backgroundColor: colors.surfaceBlue }}>
            <ShieldCheck color={colors.primary} size={52} />
          </View>
        </View>
        <View className="mt-8">
          <AppText variant="display">Forgot Password?</AppText>
          <AppText muted className="mt-3">
            Enter your email address and FinderZ will send secure reset instructions when email delivery is enabled.
          </AppText>
        </View>
        <View className="mt-8 gap-4">
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <AppInput label="Email" placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" value={value} onBlur={onBlur} onChangeText={onChange} error={errors.email?.message} left={<Mail color={colors.outline} size={20} />} />
            )}
          />
          {message ? (
            <AppText style={{ color: colors.success, fontFamily: "Manrope_700Bold" }}>
              {message}
            </AppText>
          ) : null}
          <FormError message={error} />
          <AppButton title="Send Reset Link" loading={isSubmitting} onPress={onSubmit} />
        </View>
        <View className="mt-8 flex-row justify-center gap-1">
          <AppText muted>Remembered your password?</AppText>
          <Link href="/sign-in" asChild>
            <Pressable>
              <AppText style={{ color: colors.primary, fontFamily: "Manrope_700Bold" }}>Sign In</AppText>
            </Pressable>
          </Link>
        </View>
      </ScreenShell>
    </KeyboardAwareScreen>
  );
}

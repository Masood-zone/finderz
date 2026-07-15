import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, router, type Href } from "expo-router";
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
import { requestPasswordResetOtp } from "@/services/api/auth-flows";

const forgotPasswordSchema = z.object({
  email: z.email("Enter a valid email address."),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordScreen() {
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
    setError(undefined);

    try {
      const normalizedEmail = email.trim().toLowerCase();
      await requestPasswordResetOtp(normalizedEmail);
      router.push({ pathname: "/verify-reset-code", params: { email: normalizedEmail } } as unknown as Href);
    } catch (resetError) {
      setError(
        getErrorMessage(resetError, "Unable to start password reset. Please try again."),
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
            Enter your registered email address and FinderZ will send you a six-digit verification code.
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
          <FormError message={error} />
          <AppButton title="Send Verification Code" loading={isSubmitting} onPress={onSubmit} />
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

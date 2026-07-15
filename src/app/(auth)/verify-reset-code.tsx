import { zodResolver } from "@hookform/resolvers/zod";
import { router, useLocalSearchParams, type Href } from "expo-router";
import { KeyRound, ShieldCheck } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { View } from "react-native";
import { z } from "zod";
import { AppButton } from "@/components/ui/app-button";
import { AppInput } from "@/components/ui/app-input";
import { AppText } from "@/components/ui/app-text";
import { colors, radius } from "@/components/ui/design-system";
import { FormError } from "@/components/ui/form-error";
import { KeyboardAwareScreen } from "@/components/ui/keyboard-aware-screen";
import { ScreenShell } from "@/components/ui/screen-shell";
import { getErrorMessage } from "@/lib/get-error-message";
import { requestPasswordResetOtp, verifyPasswordResetOtp } from "@/services/api/auth-flows";

const otpSchema = z.object({ otp: z.string().regex(/^\d{6}$/, "Enter the six-digit verification code.") });
type OtpFormValues = z.infer<typeof otpSchema>;

export default function VerifyResetCodeScreen() {
  const params = useLocalSearchParams<{ email?: string }>();
  const email = typeof params.email === "string" ? params.email : "";
  const [error, setError] = useState<string | undefined>();
  const [message, setMessage] = useState<string | undefined>();
  const [resendSeconds, setResendSeconds] = useState(60);
  const [isResending, setIsResending] = useState(false);
  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema as never),
    defaultValues: { otp: "" },
  });

  useEffect(() => {
    if (resendSeconds <= 0) return;
    const timer = setTimeout(() => setResendSeconds((current) => current - 1), 1_000);
    return () => clearTimeout(timer);
  }, [resendSeconds]);

  const onSubmit = handleSubmit(async ({ otp }) => {
    setError(undefined);
    setMessage(undefined);
    if (!email) {
      setError("Your reset request is missing. Return to Forgot Password and request a new code.");
      return;
    }

    try {
      const { resetToken } = await verifyPasswordResetOtp(email, otp);
      router.replace({ pathname: "/reset-password", params: { token: resetToken } } as unknown as Href);
    } catch (verificationError) {
      setError(getErrorMessage(verificationError, "That code is invalid or has expired."));
    }
  });

  const resend = async () => {
    if (!email || resendSeconds > 0) return;
    setError(undefined);
    setMessage(undefined);
    setIsResending(true);
    try {
      await requestPasswordResetOtp(email);
      setResendSeconds(60);
      setMessage("If that email is registered, a new code has been sent.");
    } catch (resendError) {
      setError(getErrorMessage(resendError, "Unable to resend the code. Please try again."));
    } finally {
      setIsResending(false);
    }
  };

  return (
    <KeyboardAwareScreen>
      <ScreenShell showBack>
        <View className="mt-8 items-center">
          <View className="h-28 w-28 items-center justify-center" style={{ borderRadius: radius.xxl, backgroundColor: colors.surfaceBlue }}>
            <ShieldCheck color={colors.primary} size={52} />
          </View>
        </View>
        <View className="mt-8">
          <AppText variant="display">Verify your code</AppText>
          <AppText muted className="mt-3">
            Enter the six-digit code sent to {email || "your email address"}. It expires in 10 minutes.
          </AppText>
        </View>
        <View className="mt-8 gap-4">
          <Controller
            control={control}
            name="otp"
            render={({ field: { onChange, onBlur, value } }) => (
              <AppInput
                label="Verification Code"
                placeholder="000000"
                keyboardType="number-pad"
                textContentType="oneTimeCode"
                autoComplete="one-time-code"
                maxLength={6}
                value={value}
                onBlur={onBlur}
                onChangeText={(next) => onChange(next.replace(/\D/g, ""))}
                error={errors.otp?.message}
                left={<KeyRound color={colors.outline} size={20} />}
                style={{ fontSize: 22, letterSpacing: 8, textAlign: "center" }}
              />
            )}
          />
          {message ? <AppText style={{ color: colors.success, fontFamily: "Manrope_700Bold" }}>{message}</AppText> : null}
          <FormError message={error} />
          <AppButton title="Verify Code" loading={isSubmitting} onPress={onSubmit} />
          <AppButton
            title={resendSeconds > 0 ? `Resend Code in ${resendSeconds}s` : "Resend Code"}
            variant="ghost"
            disabled={resendSeconds > 0}
            loading={isResending}
            onPress={() => void resend()}
          />
        </View>
      </ScreenShell>
    </KeyboardAwareScreen>
  );
}

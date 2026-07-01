import { AppButton } from "@/components/ui/app-button";
import { AppInput } from "@/components/ui/app-input";
import { AppText } from "@/components/ui/app-text";
import { AuthHeader } from "@/components/ui/auth-header";
import { Checkbox } from "@/components/ui/checkbox";
import { colors } from "@/components/ui/design-system";
import { FormError } from "@/components/ui/form-error";
import { KeyboardAwareScreen } from "@/components/ui/keyboard-aware-screen";
import { PasswordInput } from "@/components/ui/password-input";
import { getErrorMessage } from "@/lib/get-error-message";
import { signInWithEmail } from "@/services/api/auth-flows";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, router } from "expo-router";
import { Mail } from "lucide-react-native";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Pressable, View } from "react-native";
import { z } from "zod";

const signInSchema = z.object({
  email: z.email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
  remember: z.boolean(),
});

type SignInFormValues = z.infer<typeof signInSchema>;

export default function SignInScreen() {
  const [error, setError] = useState<string | undefined>();
  const [googleMessage, setGoogleMessage] = useState<string | undefined>();
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema as never),
    defaultValues: { email: "", password: "", remember: true },
  });

  const onSubmit = handleSubmit(async (values) => {
    setError(undefined);
    setGoogleMessage(undefined);

    try {
      await signInWithEmail({
        email: values.email.trim(),
        password: values.password,
      });
      router.replace("/");
    } catch (signInError) {
      setError(
        getErrorMessage(
          signInError,
          "Unable to sign in. Please check your details and try again.",
        ),
      );
    }
  });

  return (
    <KeyboardAwareScreen>
      <View className="flex-1 px-6 py-8">
        <AuthHeader
          title="Welcome back"
          subtitle="Sign in to continue your FinderZ housing journey."
        />

        <View className="mt-10 gap-4">
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <AppInput
                label="Email"
                placeholder="you@gmail.com"
                autoCapitalize="none"
                keyboardType="email-address"
                textContentType="emailAddress"
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                error={errors.email?.message}
                left={<Mail color={colors.outline} size={20} />}
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <PasswordInput
                label="Password"
                placeholder="Enter your password"
                textContentType="password"
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                error={errors.password?.message}
              />
            )}
          />

          <View className="flex-row items-center justify-between gap-4">
            <Controller
              control={control}
              name="remember"
              render={({ field: { onChange, value } }) => (
                <Checkbox
                  checked={value}
                  onChange={onChange}
                  label={<AppText muted>Remember me</AppText>}
                />
              )}
            />
            <Link href="/forgot-password" asChild>
              <Pressable>
                <AppText
                  style={{
                    color: colors.primary,
                    fontFamily: "Manrope_700Bold",
                  }}
                >
                  Forgot Password?
                </AppText>
              </Pressable>
            </Link>
          </View>

          <FormError
            message={error ?? googleMessage}
            title={error ? "Sign in failed" : "Google sign-in unavailable"}
            tone={error ? "error" : "info"}
          />

          <AppButton
            title="Sign In"
            loading={isSubmitting}
            onPress={onSubmit}
          />
          {/* <AppButton
            title="Continue with Google"
            variant="secondary"
            onPress={() =>
              setGoogleMessage(
                "Google sign-in is not configured for this FinderZ environment yet.",
              )
            }
          /> */}
        </View>

        <View className="mt-8 flex-row justify-center gap-1">
          <AppText muted>New to FinderZ?</AppText>
          <Link href="/sign-up" asChild>
            <Pressable accessibilityRole="button">
              <AppText
                style={{
                  color: colors.primary,
                  fontFamily: "Manrope_700Bold",
                }}
              >
                Create account
              </AppText>
            </Pressable>
          </Link>
        </View>
      </View>
    </KeyboardAwareScreen>
  );
}

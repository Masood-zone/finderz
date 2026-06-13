import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, router } from "expo-router";
import { Mail, Phone, UserRound } from "lucide-react-native";
import { Pressable, View } from "react-native";
import { z } from "zod";
import { AuthHeader } from "@/components/ui/auth-header";
import { AppButton } from "@/components/ui/app-button";
import { AppInput } from "@/components/ui/app-input";
import { AppText } from "@/components/ui/app-text";
import { Checkbox } from "@/components/ui/checkbox";
import { colors } from "@/components/ui/design-system";
import { FormError } from "@/components/ui/form-error";
import { KeyboardAwareScreen } from "@/components/ui/keyboard-aware-screen";
import { PasswordInput } from "@/components/ui/password-input";
import { getErrorMessage } from "@/lib/get-error-message";
import { signUpWithEmail } from "@/services/api/auth-flows";
import { useAssignRole } from "@/services/queries/hooks";
import { useOnboardingStore } from "@/store/onboarding-store";
import type { PublicOnboardingRole } from "@/types/auth";

const signUpSchema = z
  .object({
    name: z.string().trim().min(2, "Enter your full name."),
    email: z.email("Enter a valid email address."),
    phone: z.string().trim().min(9, "Enter a valid Ghana phone number."),
    password: z.string().min(8, "Use at least 8 characters."),
    confirmPassword: z.string().min(1, "Confirm your password."),
    terms: z.boolean().refine((value) => value, "Accept the terms to continue."),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });

type SignUpFormValues = z.infer<typeof signUpSchema>;

function getRoleLabel(role: PublicOnboardingRole | null) {
  return role === "LANDLORD" ? "Landlord account" : "Tenant account";
}

export default function SignUpScreen() {
  const [error, setError] = useState<string | undefined>();
  const [googleMessage, setGoogleMessage] = useState<string | undefined>();
  const selectedRole = useOnboardingStore((state) => state.selectedRole);
  const setSelectedRole = useOnboardingStore((state) => state.setSelectedRole);
  const setHasSeenPublicOnboarding = useOnboardingStore((state) => state.setHasSeenPublicOnboarding);
  const assignRoleMutation = useAssignRole();
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema as never),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      terms: false,
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    const role = selectedRole ?? "TENANT";
    setError(undefined);
    setGoogleMessage(undefined);

    try {
      await signUpWithEmail({
        name: values.name.trim(),
        email: values.email.trim(),
        password: values.password,
        phone: values.phone.trim(),
      });
      await assignRoleMutation.mutateAsync({ role });
      setHasSeenPublicOnboarding(true);
      setSelectedRole(null);
      router.replace("/");
    } catch (signUpError) {
      setError(getErrorMessage(signUpError, "Unable to create your account. Please try again."));
    }
  });

  return (
    <KeyboardAwareScreen>
      <View className="flex-1 px-6 py-8">
        <AuthHeader title="Create account" subtitle={`Set up your ${getRoleLabel(selectedRole).toLowerCase()} on FinderZ.`} />

        <View className="mt-5 self-start rounded-full px-3 py-2" style={{ backgroundColor: colors.surfaceBlue }}>
          <AppText variant="caption" style={{ color: colors.primary, fontFamily: "Manrope_700Bold" }}>
            {getRoleLabel(selectedRole)}
          </AppText>
        </View>

        <View className="mt-6 gap-4">
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, onBlur, value } }) => (
              <AppInput label="Full Name" placeholder="Your full name" value={value} onBlur={onBlur} onChangeText={onChange} error={errors.name?.message} left={<UserRound color={colors.outline} size={20} />} />
            )}
          />
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <AppInput
                label="Email"
                placeholder="you@example.com"
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
            name="phone"
            render={({ field: { onChange, onBlur, value } }) => (
              <AppInput
                label="Phone"
                placeholder="024 000 0000"
                keyboardType="phone-pad"
                textContentType="telephoneNumber"
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                error={errors.phone?.message}
                left={<Phone color={colors.outline} size={20} />}
              />
            )}
          />
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <PasswordInput label="Password" placeholder="Create a password" textContentType="newPassword" value={value} onBlur={onBlur} onChangeText={onChange} error={errors.password?.message} />
            )}
          />
          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { onChange, onBlur, value } }) => (
              <PasswordInput label="Confirm Password" placeholder="Repeat your password" textContentType="newPassword" value={value} onBlur={onBlur} onChangeText={onChange} error={errors.confirmPassword?.message} />
            )}
          />
          <Controller
            control={control}
            name="terms"
            render={({ field: { onChange, value } }) => (
              <Checkbox checked={value} onChange={onChange} label={<AppText muted>I agree to the FinderZ terms and privacy policy.</AppText>} />
            )}
          />
          <FormError message={errors.terms?.message ?? error ?? googleMessage} />
          <AppButton title="Create Account" loading={isSubmitting || assignRoleMutation.isPending} onPress={onSubmit} />
          <AppButton title="Continue with Google" variant="secondary" onPress={() => setGoogleMessage("Google sign-up is not configured for this FinderZ environment yet.")} />
        </View>

        <View className="mt-8 flex-row justify-center gap-1">
          <AppText muted>Already have an account?</AppText>
          <Link href="/sign-in" asChild>
            <Pressable>
              <AppText style={{ color: colors.primary, fontFamily: "Manrope_700Bold" }}>Sign In</AppText>
            </Pressable>
          </Link>
        </View>
      </View>
    </KeyboardAwareScreen>
  );
}

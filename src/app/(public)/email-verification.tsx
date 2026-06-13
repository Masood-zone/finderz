import { useMemo, useState } from "react";
import { Link, useLocalSearchParams } from "expo-router";
import { MailCheck, ShieldCheck } from "lucide-react-native";
import { Pressable, View } from "react-native";
import { AppButton } from "@/components/ui/app-button";
import { AppText } from "@/components/ui/app-text";
import { colors, radius } from "@/components/ui/design-system";
import { FinderzLogo } from "@/components/ui/finderz-logo";
import { FormError } from "@/components/ui/form-error";
import { SafeAreaScreen } from "@/components/ui/safe-area-screen";
import { getErrorMessage } from "@/lib/get-error-message";
import { resendVerificationEmail } from "@/services/api/auth-flows";

export default function EmailVerificationScreen() {
  const params = useLocalSearchParams<{ email?: string }>();
  const email = useMemo(() => (Array.isArray(params.email) ? params.email[0] : params.email), [params.email]);
  const [message, setMessage] = useState<string | undefined>();
  const [error, setError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resend = async () => {
    if (!email) {
      setError("Open this screen from a FinderZ email flow so we know which address to verify.");
      return;
    }

    setIsSubmitting(true);
    setError(undefined);
    setMessage(undefined);

    try {
      await resendVerificationEmail(email);
      setMessage("Verification email sent. Check your inbox for the latest FinderZ link.");
    } catch (verificationError) {
      setError(getErrorMessage(verificationError, "Email verification delivery is not configured yet."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaScreen scroll>
      <View className="flex-1 px-6 py-8">
        <View className="items-center">
          <FinderzLogo variant="text" size="md" />
        </View>
        <View className="mt-12 items-center">
          <View className="h-28 w-28 items-center justify-center" style={{ borderRadius: radius.xxl, backgroundColor: colors.gold }}>
            <MailCheck color={colors.goldDark} size={56} />
          </View>
          <AppText variant="display" className="mt-8 text-center">
            Check your email
          </AppText>
          <AppText muted className="mt-3 text-center">
            We sent a verification link{email ? ` to ${email}` : ""}. Open it to finish securing your FinderZ account.
          </AppText>
        </View>

        <View className="mt-10 gap-3">
          <Link href="/sign-in" asChild>
            <AppButton title="Sign In" />
          </Link>
          <AppButton title="Resend Email" variant="secondary" loading={isSubmitting} onPress={resend} />
          {message ? (
            <AppText className="text-center" style={{ color: colors.success, fontFamily: "Manrope_700Bold" }}>
              {message}
            </AppText>
          ) : null}
          <FormError message={error} />
        </View>

        <View className="mt-8 flex-row gap-3 rounded-2xl p-4" style={{ backgroundColor: colors.surfaceBlue }}>
          <ShieldCheck color={colors.primary} size={22} />
          <AppText muted className="min-w-0 flex-1">
            FinderZ uses email verification to protect Ghanaian real estate enquiries and landlord accounts.
          </AppText>
        </View>

        <View className="mt-8 items-center">
          <Link href="/sign-in" asChild>
            <Pressable>
              <AppText style={{ color: colors.primary, fontFamily: "Manrope_700Bold" }}>Back to Sign In</AppText>
            </Pressable>
          </Link>
        </View>
      </View>
    </SafeAreaScreen>
  );
}

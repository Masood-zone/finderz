import { Body, Container, Head, Heading, Html, Preview, Section, Text } from "@react-email/components";

interface PasswordResetOtpEmailProps {
  name: string;
  otp: string;
  expiresInMinutes: number;
}

export function PasswordResetOtpEmail({ name, otp, expiresInMinutes }: PasswordResetOtpEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your FinderZ password reset code is {otp}</Preview>
      <Body style={{ backgroundColor: "#f8f9ff", fontFamily: "Arial, sans-serif" }}>
        <Container style={{ backgroundColor: "#ffffff", border: "1px solid #d3e4fe", borderRadius: "12px", margin: "32px auto", padding: "28px", width: "520px" }}>
          <Heading style={{ color: "#00236f", fontSize: "24px", margin: "0 0 12px" }}>
            Reset your FinderZ password
          </Heading>
          <Text style={{ color: "#444651", fontSize: "15px", lineHeight: "24px" }}>
            Hello {name}, enter this verification code in FinderZ to continue resetting your password.
          </Text>
          <Section style={{ backgroundColor: "#eff4ff", borderRadius: "10px", margin: "24px 0", padding: "22px", textAlign: "center" }}>
            <Text style={{ color: "#00236f", fontSize: "34px", fontWeight: "700", letterSpacing: "10px", margin: 0 }}>
              {otp}
            </Text>
          </Section>
          <Text style={{ color: "#444651", fontSize: "14px", lineHeight: "22px" }}>
            This code expires in {expiresInMinutes} minutes. FinderZ will never ask you to share it. If you did not request a password reset, you can safely ignore this email.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

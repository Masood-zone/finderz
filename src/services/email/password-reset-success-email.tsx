import { Body, Container, Head, Heading, Html, Preview, Section, Text } from "@react-email/components";

interface PasswordResetSuccessEmailProps {
  name: string;
  resetAt: string;
}

export function PasswordResetSuccessEmail({ name, resetAt }: PasswordResetSuccessEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your FinderZ password was changed successfully</Preview>
      <Body style={{ backgroundColor: "#f8f9ff", fontFamily: "Arial, sans-serif" }}>
        <Container style={{ backgroundColor: "#ffffff", border: "1px solid #d3e4fe", borderRadius: "12px", margin: "32px auto", padding: "28px", width: "520px" }}>
          <Heading style={{ color: "#00236f", fontSize: "24px", margin: "0 0 12px" }}>
            Password changed successfully
          </Heading>
          <Text style={{ color: "#444651", fontSize: "15px", lineHeight: "24px" }}>
            Hello {name}, your FinderZ password has been reset successfully.
          </Text>
          <Section style={{ backgroundColor: "#eff4ff", borderRadius: "10px", margin: "20px 0", padding: "18px" }}>
            <Text style={{ color: "#0b1c30", fontSize: "14px", margin: 0 }}>
              Changed at: <strong>{resetAt}</strong>
            </Text>
          </Section>
          <Text style={{ color: "#444651", fontSize: "14px", lineHeight: "22px" }}>
            All existing sessions were signed out for your security. If you did not make this change, contact FinderZ support immediately.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

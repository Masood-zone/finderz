import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components"

interface MemberInvitationEmailProps {
  memberEmail: string
  memberName: string
  organizationName: string
  password: string
  signinUrl: string
}

export function MemberInvitationEmail({
  memberEmail,
  memberName,
  organizationName,
  password,
  signinUrl,
}: MemberInvitationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>You have been added to {organizationName} on Amanah Welfare.</Preview>
      <Body style={{ backgroundColor: "#faf8ff", fontFamily: "Arial, sans-serif" }}>
        <Container
          style={{
            backgroundColor: "#ffffff",
            border: "1px solid #dbe2dd",
            borderRadius: "8px",
            margin: "32px auto",
            padding: "28px",
            width: "520px",
          }}
        >
          <Heading style={{ color: "#003527", fontSize: "24px", margin: "0 0 12px" }}>
            Welcome to Amanah Welfare
          </Heading>
          <Text style={{ color: "#404944", fontSize: "15px", lineHeight: "24px" }}>
            Hello {memberName}, {organizationName} has added you as a member on
            Amanah Welfare.
          </Text>
          <Section
            style={{
              backgroundColor: "#f4f6ee",
              border: "1px solid #dbe2dd",
              borderRadius: "8px",
              margin: "20px 0",
              padding: "20px",
            }}
          >
            <Text
              style={{
                color: "#003527",
                fontSize: "13px",
                fontWeight: 700,
                letterSpacing: "0.04em",
                margin: "0 0 12px",
                textTransform: "uppercase",
              }}
            >
              Your login details
            </Text>
            <Text style={{ color: "#131b2e", fontSize: "14px", margin: "0 0 8px" }}>
              Email: <strong>{memberEmail}</strong>
            </Text>
            <Text style={{ color: "#131b2e", fontSize: "14px", margin: "0 0 8px" }}>
              Password: <strong>{password}</strong>
            </Text>
            <Text style={{ color: "#131b2e", fontSize: "14px", margin: 0 }}>
              Login: {signinUrl || "Your Amanah Welfare login page"}
            </Text>
          </Section>
          <Text style={{ color: "#404944", fontSize: "14px", lineHeight: "22px" }}>
            Please sign in and update your password from your account settings.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

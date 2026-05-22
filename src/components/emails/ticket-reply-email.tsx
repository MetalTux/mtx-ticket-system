// src/components/emails/ticket-reply-email.tsx
import {
  Html, Body, Container, Text, Link, Preview, Section, Heading, Hr
} from "@react-email/components";

interface TicketReplyEmailProps {
  folio: string;
  ticketTitle: string;
  authorName: string;
  message: string;
  ticketId: string;
}

export const TicketReplyEmail = ({
  folio, ticketTitle, authorName, message, ticketId
}: TicketReplyEmailProps) => {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://mtx-ticket-system.vercel.app";

  return (
    <Html>
      <Preview>Nueva respuesta en el ticket {folio}</Preview>
      <Body style={{ backgroundColor: "#f8fafc", padding: "20px 0", fontFamily: "sans-serif" }}>
        <Container style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "40px", maxWidth: "600px", margin: "0 auto" }}>
          <Heading style={{ color: "#0f172a", fontSize: "24px", fontWeight: "800", letterSpacing: "-0.025em", marginBottom: "16px" }}>
            Nueva actualización
          </Heading>
          <Text style={{ color: "#475569", fontSize: "16px", lineHeight: "24px" }}>
            <strong>{authorName}</strong> ha respondido al ticket:
          </Text>
          
          <Section style={{ backgroundColor: "#f1f5f9", padding: "20px", borderRadius: "8px", margin: "24px 0" }}>
            <Text style={{ margin: "0 0 8px 0", fontSize: "12px", fontWeight: "bold", color: "#64748b", textTransform: "uppercase" }}>
              {folio} - {ticketTitle}
            </Text>
            <Text style={{ margin: "0", color: "#1e293b", fontStyle: "italic" }}>
              &quot;{message}&quot;
            </Text>
          </Section>

          <Section style={{ textAlign: "center", marginTop: "32px" }}>
            <Link href={`${baseUrl}/dashboard/tickets/${ticketId}`} style={{ backgroundColor: "#0f172a", color: "#ffffff", padding: "12px 24px", borderRadius: "8px", fontWeight: "bold", textDecoration: "none", display: "inline-block" }}>
              Ver ticket completo
            </Link>
          </Section>

          <Hr style={{ borderColor: "#e2e8f0", margin: "40px 0 20px" }} />
          <Text style={{ color: "#94a3b8", fontSize: "12px", textAlign: "center" }}>
            GTSoft - Gestión de Tickets
          </Text>
        </Container>
      </Body>
    </Html>
  );
};
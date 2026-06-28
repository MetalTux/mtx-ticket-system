// src/components/emails/ticket-assigned-email.tsx
import {
  Html, Body, Container, Text, Link, Preview, Section, Heading, Hr
} from "@react-email/components";

interface TicketAssignedEmailProps {
  folio: string;
  title: string;
  assignedToName: string;
  assignedByName: string;
  ticketId: string;
}

export const TicketAssignedEmail = ({
  folio, title, assignedToName, assignedByName, ticketId
}: TicketAssignedEmailProps) => {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://mtx-ticket-system.vercel.app";

  return (
    <Html>
      <Preview>Nuevo ticket asignado: {folio}</Preview>
      <Body style={{ backgroundColor: "#f8fafc", padding: "20px 0", fontFamily: "sans-serif" }}>
        <Container style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderTop: "4px solid #3b82f6", borderRadius: "12px", padding: "40px", maxWidth: "600px", margin: "0 auto" }}>
          <Heading style={{ color: "#0f172a", fontSize: "24px", fontWeight: "800", letterSpacing: "-0.025em", marginBottom: "16px" }}>
            Ticket Asignado
          </Heading>
          <Text style={{ color: "#475569", fontSize: "16px", lineHeight: "24px" }}>
            Hola <strong>{assignedToName}</strong>, se te ha derivado un nuevo requerimiento para su gestión.
          </Text>
          
          <Section style={{ backgroundColor: "#eff6ff", border: "1px solid #bfdbfe", padding: "20px", borderRadius: "8px", margin: "24px 0" }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Text style={{ margin: "0", fontSize: "12px", fontWeight: "bold", color: "#3b82f6", textTransform: "uppercase" }}>Folio: <span style={{ color: "#1e3a8a" }}>{folio}</span></Text>
              <Text style={{ margin: "4px 0", fontSize: "16px", fontWeight: "bold", color: "#1e3a8a" }}>{title}</Text>
              <Hr style={{ borderColor: "#bfdbfe", margin: "10px 0" }} />
              <Text style={{ margin: "0", fontSize: "13px", color: "#475569" }}><strong>Asignado por:</strong> {assignedByName}</Text>
            </div>
          </Section>

          <Section style={{ textAlign: "center", marginTop: "32px" }}>
            <Link href={`${baseUrl}/dashboard/tickets/${ticketId}`} style={{ backgroundColor: "#3b82f6", color: "#ffffff", padding: "12px 24px", borderRadius: "8px", fontWeight: "bold", textDecoration: "none", display: "inline-block" }}>
              Ir al Ticket
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
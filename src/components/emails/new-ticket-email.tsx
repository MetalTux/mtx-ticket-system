// src/components/emails/new-ticket-email.tsx
import {
  Html, Body, Container, Text, Link, Preview, Section, Heading, Hr
} from "@react-email/components";

interface NewTicketEmailProps {
  folio: string;
  title: string;
  userName: string;
  category: string;
  priority: string;
  ticketId: string;
}

export const NewTicketEmail = ({
  folio, title, userName, category, priority, ticketId
}: NewTicketEmailProps) => {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://mtx-ticket-system.vercel.app";

  return (
    <Html>
      <Preview>Ticket Recibido: {folio}</Preview>
      <Body style={{ backgroundColor: "#f8fafc", padding: "20px 0", fontFamily: "sans-serif" }}>
        <Container style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "40px", maxWidth: "600px", margin: "0 auto" }}>
          <Heading style={{ color: "#0f172a", fontSize: "24px", fontWeight: "800", letterSpacing: "-0.025em", marginBottom: "16px" }}>
            ¡Ticket Registrado!
          </Heading>
          <Text style={{ color: "#475569", fontSize: "16px", lineHeight: "24px" }}>
            Hola <strong>{userName}</strong>, hemos recibido tu requerimiento exitosamente. Un técnico revisará tu caso a la brevedad.
          </Text>
          
          <Section style={{ backgroundColor: "#f1f5f9", padding: "20px", borderRadius: "8px", margin: "24px 0" }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Text style={{ margin: "0", fontSize: "12px", fontWeight: "bold", color: "#64748b", textTransform: "uppercase" }}>Folio: <span style={{ color: "#0f172a" }}>{folio}</span></Text>
              <Text style={{ margin: "4px 0", fontSize: "16px", fontWeight: "bold", color: "#1e293b" }}>{title}</Text>
              <Hr style={{ borderColor: "#cbd5e1", margin: "10px 0" }} />
              <Text style={{ margin: "0", fontSize: "13px", color: "#475569" }}><strong>Categoría:</strong> {category}</Text>
              <Text style={{ margin: "0", fontSize: "13px", color: "#475569" }}><strong>Prioridad:</strong> {priority}</Text>
            </div>
          </Section>

          <Section style={{ textAlign: "center", marginTop: "32px" }}>
            <Link href={`${baseUrl}/dashboard/tickets/${ticketId}`} style={{ backgroundColor: "#0f172a", color: "#ffffff", padding: "12px 24px", borderRadius: "8px", fontWeight: "bold", textDecoration: "none", display: "inline-block" }}>
              Seguir mi ticket
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
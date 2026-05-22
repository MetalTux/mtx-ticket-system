// src/components/emails/ticket-resolved-email.tsx
import {
  Html, Body, Container, Text, Link, Preview, Section, Heading, Hr
} from "@react-email/components";

interface TicketResolvedEmailProps {
  folio: string;
  title: string;
  userName: string;
  solutionSummary?: string;
  ticketId: string;
}

export const TicketResolvedEmail = ({
  folio, title, userName, solutionSummary, ticketId
}: TicketResolvedEmailProps) => {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://mtx-ticket-system.vercel.app";

  return (
    <Html>
      <Preview>Ticket Resuelto: {folio}</Preview>
      <Body style={{ backgroundColor: "#f8fafc", padding: "20px 0", fontFamily: "sans-serif" }}>
        <Container style={{ backgroundColor: "#ffffff", border: "2px solid #10b981", borderRadius: "12px", padding: "40px", maxWidth: "600px", margin: "0 auto" }}>
          <Section style={{ textAlign: "center", marginBottom: "24px" }}>
             <span style={{ backgroundColor: "#ecfdf5", color: "#059669", padding: "8px 16px", borderRadius: "20px", fontSize: "12px", fontWeight: "bold", textTransform: "uppercase" }}>
               Caso Finalizado
             </span>
          </Section>
          
          <Heading style={{ color: "#064e3b", fontSize: "24px", fontWeight: "800", textAlign: "center", marginBottom: "16px" }}>
            Tu requerimiento ha sido resuelto
          </Heading>
          
          <Text style={{ color: "#475569", fontSize: "16px", lineHeight: "24px" }}>
            Hola <strong>{userName}</strong>, te informamos que el ticket <strong>{folio}</strong> ha cambiado su estado a <strong>RESUELTO</strong>.
          </Text>

          {solutionSummary && (
            <Section style={{ backgroundColor: "#f8fafc", borderLeft: "4px solid #10b981", padding: "16px", margin: "24px 0" }}>
              <Text style={{ margin: "0", fontSize: "14px", color: "#1e293b" }}>
                <strong>Resumen de resolución:</strong><br/>
                {solutionSummary}
              </Text>
            </Section>
          )}

          <Text style={{ color: "#64748b", fontSize: "14px", marginTop: "24px" }}>
            Si consideras que el problema persiste, puedes reabrir el ticket desde la plataforma o contactar a soporte.
          </Text>

          <Section style={{ textAlign: "center", marginTop: "32px" }}>
            <Link href={`${baseUrl}/dashboard/tickets/${ticketId}`} style={{ backgroundColor: "#10b981", color: "#ffffff", padding: "12px 24px", borderRadius: "8px", fontWeight: "bold", textDecoration: "none", display: "inline-block" }}>
              Ver detalles finales
            </Link>
          </Section>

          <Hr style={{ borderColor: "#e2e8f0", margin: "40px 0 20px" }} />
          <Text style={{ color: "#94a3b8", fontSize: "11px", textAlign: "center" }}>
            GTSoft - Gestión de Tickets
          </Text>
        </Container>
      </Body>
    </Html>
  );
};
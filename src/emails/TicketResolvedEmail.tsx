// src/emails/TicketResolvedEmail.tsx
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
  Button,
} from "@react-email/components";
import * as React from "react";

interface TicketResolvedEmailProps {
  folio: string;
  title: string;
  userName: string;
  solutionSummary?: string;
  ticketId: string;
}

export const TicketResolvedEmail = ({
  folio,
  title,
  userName,
  solutionSummary,
  ticketId,
}: TicketResolvedEmailProps) => {
  const baseUrl = process.env.NEXTAUTH_URL || "https://mtx-ticket-system.vercel.app";

  return (
    <Html>
      <Head />
      <Preview>Caso Resuelto: {folio}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={logo}>MTX Ticket System</Text>
          </Section>
          
          <Heading style={h1}>Tu solicitud ha sido resuelta</Heading>
          
          <Section style={section}>
            <Text style={text}>Hola <strong>{userName}</strong>,</Text>
            <Text style={text}>
              Te informamos que el ticket <strong>{folio}</strong> ha sido marcado como <strong>RESUELTO</strong> por nuestro equipo de soporte.
            </Text>

            <Section style={contextBox}>
              <Text style={contextTitle}>{title}</Text>
            </Section>

            {solutionSummary && (
              <Section style={solutionBox}>
                <Text style={solutionLabel}>NOTAS DE RESOLUCIÓN:</Text>
                <div 
                  style={solutionText} 
                  dangerouslySetInnerHTML={{ __html: solutionSummary }} 
                />
              </Section>
            )}

            <Text style={infoText}>
              Si consideras que el inconveniente persiste, puedes revisar los detalles o solicitar reabrir el caso haciendo clic en el botón inferior.
            </Text>

            <Button
              style={button}
              href={`${baseUrl}/dashboard/tickets/${ticketId}`}
            >
              Ver Detalles del Cierre
            </Button>
          </Section>
          
          <Hr style={hr} />
          
          <Text style={footer}>
            Gracias por utilizar nuestro sistema de soporte.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default TicketResolvedEmail;

// Estilos
const main = { backgroundColor: "#f6f9fc", fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif' };
const container = { margin: "0 auto", padding: "20px 0 48px", width: "580px" };
const header = { padding: "20px", textAlign: "center" as const };
const logo = { fontSize: "22px", fontWeight: "900", color: "#10b981", margin: 0 }; // Verde para éxito
const h1 = { color: "#064e3b", fontSize: "24px", fontWeight: "700", textAlign: "center" as const, margin: "20px 0" };
const section = { backgroundColor: "#ffffff", padding: "40px", borderRadius: "12px", border: "2px solid #10b981" }; // Borde verde
const text = { color: "#525f7f", fontSize: "16px", lineHeight: "24px", margin: "0 0 16px 0" };
const contextBox = { backgroundColor: "#f8fafc", padding: "16px", borderRadius: "8px", marginBottom: "20px" };
const contextTitle = { color: "#1e293b", fontSize: "15px", fontWeight: "600", margin: "0", textAlign: "center" as const };
const solutionBox = { backgroundColor: "#ecfdf5", padding: "20px", borderRadius: "8px", borderLeft: "4px solid #10b981", marginBottom: "24px" };
const solutionLabel = { color: "#059669", fontSize: "12px", fontWeight: "bold", margin: "0 0 8px 0" };
const solutionText = { color: "#064e3b", fontSize: "15px", margin: "0", lineHeight: "24px" };
const infoText = { color: "#64748b", fontSize: "14px", lineHeight: "22px", margin: "0 0 24px 0" };
const button = { backgroundColor: "#10b981", borderRadius: "6px", color: "#fff", fontSize: "16px", fontWeight: "600", textDecoration: "none", textAlign: "center" as const, display: "block", width: "100%", padding: "14px 0" };
const hr = { borderColor: "#e6ebf1", margin: "20px 0" };
const footer = { color: "#8898aa", fontSize: "12px", textAlign: "center" as const };
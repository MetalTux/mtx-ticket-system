// src/emails/TicketAssignedEmail.tsx
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

interface TicketAssignedEmailProps {
  folio: string;
  title: string;
  assignedToName: string;
  assignedByName: string;
  ticketId: string;
}

export const TicketAssignedEmail = ({
  folio,
  title,
  assignedToName,
  assignedByName,
  ticketId,
}: TicketAssignedEmailProps) => {
  const baseUrl = process.env.NEXTAUTH_URL || "https://mtx-ticket-system.vercel.app";

  return (
    <Html>
      <Head />
      <Preview>Nuevo ticket asignado: {folio}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={logo}>MTX Ticket System</Text>
          </Section>
          
          <Heading style={h1}>Asignación de Ticket</Heading>
          
          <Section style={section}>
            <Text style={text}>Hola <strong>{assignedToName}</strong>,</Text>
            <Text style={text}>
              Se te ha derivado un nuevo requerimiento para su gestión y resolución.
            </Text>

            <Section style={contextBox}>
              <Text style={contextLabel}>{folio}</Text>
              <Text style={contextTitle}>{title}</Text>
            </Section>

            <Section style={infoSection}>
              <Text style={infoText}><strong>Asignado por:</strong> {assignedByName}</Text>
            </Section>

            <Button
              style={button}
              href={`${baseUrl}/dashboard/tickets/${ticketId}`}
            >
              Ver Detalles del Ticket
            </Button>
          </Section>
          
          <Hr style={hr} />
          
          <Text style={footer}>
            MetalTux Ticket System - Este es un correo automático, por favor no respondas.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default TicketAssignedEmail;

// Estilos
const main = { backgroundColor: "#f6f9fc", fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif' };
const container = { margin: "0 auto", padding: "20px 0 48px", width: "580px" };
const header = { padding: "32px" };
const logo = { fontSize: "24px", fontWeight: "900", color: "#2563eb", textAlign: "center" as const, margin: 0 };
const h1 = { color: "#1a1f36", fontSize: "24px", fontWeight: "600", textAlign: "center" as const, margin: "30px 0" };
const section = { backgroundColor: "#ffffff", padding: "40px", borderRadius: "12px", border: "1px solid #e6ebf1" };
const text = { color: "#525f7f", fontSize: "16px", lineHeight: "24px", textAlign: "left" as const, margin: "0 0 16px 0" };
const contextBox = { backgroundColor: "#f8fafc", padding: "16px", borderRadius: "8px", borderLeft: "4px solid #2563eb", marginBottom: "20px" };
const contextLabel = { color: "#2563eb", fontSize: "12px", fontWeight: "bold", margin: "0 0 4px 0" };
const contextTitle = { color: "#1e293b", fontSize: "15px", fontWeight: "600", margin: "0" };
const infoSection = { marginTop: "10px", padding: "16px", backgroundColor: "#f9fafb", borderRadius: "8px" };
const infoText = { color: "#374151", fontSize: "14px", margin: "0" };
const button = { backgroundColor: "#2563eb", borderRadius: "5px", color: "#fff", fontSize: "16px", fontWeight: "600", textDecoration: "none", textAlign: "center" as const, display: "block", width: "100%", padding: "12px 0", marginTop: "25px" };
const hr = { borderColor: "#e6ebf1", margin: "20px 0" };
const footer = { color: "#8898aa", fontSize: "12px", textAlign: "center" as const };
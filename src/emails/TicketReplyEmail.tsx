// src/emails/TicketReplyEmail.tsx
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

interface TicketReplyEmailProps {
  folio: string;
  ticketTitle: string;
  authorName: string;
  message: string;
  ticketId: string;
}

export const TicketReplyEmail = ({
  folio,
  ticketTitle,
  authorName,
  message,
  ticketId,
}: TicketReplyEmailProps) => {
  const baseUrl = process.env.NEXTAUTH_URL || "https://mtx-ticket-system.vercel.app";

  return (
    <Html>
      <Head />
      <Preview>Nueva actualización en el ticket {folio}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={logo}>MTX Ticket System</Text>
          </Section>
          
          <Heading style={h1}>Nueva Actualización</Heading>
          
          <Section style={section}>
            <Text style={text}>
              <strong>{authorName}</strong> ha añadido un nuevo mensaje a tu solicitud:
            </Text>

            {/* Caja de contexto del ticket */}
            <Section style={contextBox}>
              <Text style={contextLabel}>{folio}</Text>
              <Text style={contextTitle}>{ticketTitle}</Text>
            </Section>

            {/* Caja del mensaje */}
            <Section style={messageBox}>
              <div 
                style={messageText} 
                dangerouslySetInnerHTML={{ __html: message }} 
              />
            </Section>

            <Button
              style={button}
              href={`${baseUrl}/dashboard/tickets/${ticketId}`}
            >
              Ver Ticket Completo
            </Button>
          </Section>
          
          <Hr style={hr} />
          
          <Text style={footer}>
            Recibes este correo porque estás suscrito a las notificaciones de este ticket.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default TicketReplyEmail;

// Estilos
const main = { backgroundColor: "#f6f9fc", fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif' };
const container = { margin: "0 auto", padding: "20px 0 48px", width: "580px" };
const header = { padding: "20px", textAlign: "center" as const };
const logo = { fontSize: "22px", fontWeight: "900", color: "#2563eb", margin: 0 };
const h1 = { color: "#1a1f36", fontSize: "24px", fontWeight: "700", textAlign: "center" as const, margin: "20px 0" };
const section = { backgroundColor: "#ffffff", padding: "40px", borderRadius: "12px", border: "1px solid #e6ebf1" };
const text = { color: "#525f7f", fontSize: "16px", lineHeight: "24px", margin: "0 0 20px 0" };
const contextBox = { backgroundColor: "#f8fafc", padding: "16px", borderRadius: "8px", borderLeft: "4px solid #2563eb", marginBottom: "20px" };
const contextLabel = { color: "#2563eb", fontSize: "12px", fontWeight: "bold", margin: "0 0 4px 0" };
const contextTitle = { color: "#1e293b", fontSize: "15px", fontWeight: "600", margin: "0" };
const messageBox = { backgroundColor: "#f1f5f9", padding: "20px", borderRadius: "8px", marginBottom: "24px" };
const messageText = { color: "#334155", fontSize: "15px", fontStyle: "italic", margin: "0", lineHeight: "24px" };
const button = { backgroundColor: "#2563eb", borderRadius: "6px", color: "#fff", fontSize: "16px", fontWeight: "600", textDecoration: "none", textAlign: "center" as const, display: "block", width: "100%", padding: "14px 0" };
const hr = { borderColor: "#e6ebf1", margin: "20px 0" };
const footer = { color: "#8898aa", fontSize: "12px", textAlign: "center" as const };
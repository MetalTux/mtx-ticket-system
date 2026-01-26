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
  Link,
} from "@react-email/components";
import * as React from "react";

interface TicketUpdateEmailProps {
  folio: string;
  title: string;
  newStatus: string;
  updatedBy: string;
  comment?: string;
}

export const TicketUpdateEmail = ({
  folio,
  title,
  newStatus,
  updatedBy,
  comment,
}: TicketUpdateEmailProps) => (
  <Html>
    <Head />
    <Preview>Actualización del Ticket {folio}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Text style={logo}>MTX Ticket System</Text>
        </Section>
        
        <Heading style={h1}>Actualización de Ticket</Heading>
        
        <Section style={section}>
          <Text style={text}>
            Hola, su ticket <strong>{folio}</strong> ha sido actualizado por <strong>{updatedBy}</strong>.
          </Text>
          
          <div style={statusBadge}>
            Nuevo Estado: {newStatus}
          </div>

          <Text style={titleText}>&ldquo;{title}&rdquo;</Text>

          {comment && (
            <Section style={commentSection}>
              <Text style={commentTitle}>Último comentario:</Text>
              <Text style={commentText}>{comment}</Text>
            </Section>
          )}

          <Button
            style={button}
            href={`${process.env.NEXTAUTH_URL}/dashboard/tickets/`}
          >
            Ver Ticket Completo
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

export default TicketUpdateEmail;

// Estilos (CSS-in-JS para compatibilidad de email)
const main = { backgroundColor: "#f6f9fc", fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif' };
const container = { margin: "0 auto", padding: "20px 0 48px", width: "580px" };
const header = { padding: "32px" };
const logo = { fontSize: "24px", fontWeight: "900", color: "#2563eb", textAlign: "center" as const };
const h1 = { color: "#1a1f36", fontSize: "24px", fontWeight: "600", textAlign: "center" as const, margin: "30px 0" };
const section = { backgroundColor: "#ffffff", padding: "40px", borderRadius: "12px", border: "1px solid #e6ebf1" };
const text = { color: "#525f7f", fontSize: "16px", lineHeight: "24px", textAlign: "left" as const };
const titleText = { fontStyle: "italic", color: "#8898aa", marginTop: "10px" };
const statusBadge = { backgroundColor: "#eff6ff", color: "#1e40af", padding: "8px 12px", borderRadius: "6px", fontWeight: "bold", display: "inline-block", marginTop: "16px", fontSize: "14px" };
const commentSection = { marginTop: "24px", padding: "16px", backgroundColor: "#f9fafb", borderRadius: "8px" };
const commentTitle = { fontSize: "12px", fontWeight: "bold", color: "#9ca3af", textTransform: "uppercase" as const };
const commentText = { color: "#374151", fontSize: "14px", marginTop: "4px" };
const button = { backgroundColor: "#2563eb", borderRadius: "5px", color: "#fff", fontSize: "16px", fontWeight: "600", textDecoration: "none", textAlign: "center" as const, display: "block", width: "100%", padding: "12px 0", marginTop: "25px" };
const hr = { borderColor: "#e6ebf1", margin: "20px 0" };
const footer = { color: "#8898aa", fontSize: "12px", textAlign: "center" as const };
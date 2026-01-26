// src/emails/NewTicketEmail.tsx
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

interface NewTicketEmailProps {
  folio: string;
  title: string;
  category: string;
  priority: string;
  userName: string;
  attachments?: { name: string; url: string }[];
}

export const NewTicketEmail = ({
  folio,
  title,
  category,
  priority,
  userName,
  attachments,
}: NewTicketEmailProps) => (
  <Html>
    <Head />
    <Preview>Confirmación de Ticket Recibido: {folio}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Text style={logo}>MTX Ticket System</Text>
        </Section>
        
        <Heading style={h1}>¡Hemos recibido tu requerimiento!</Heading>
        
        <Section style={section}>
          <Text style={text}>Hola <strong>{userName}</strong>,</Text>
          <Text style={text}>
            Tu solicitud ha sido registrada exitosamente. Un miembro de nuestro equipo la revisará a la brevedad.
          </Text>

          {/* Bloque de Folio Destacado */}
          <Section style={folioBox}>
            <Text style={folioLabel}>NRO. DE ATENCIÓN</Text>
            <Text style={folioText}>{folio}</Text>
          </Section>

          <Section style={detailsSection}>
            <Text style={detailItem}><strong>Asunto:</strong> {title}</Text>
            <Text style={detailItem}><strong>Categoría:</strong> {category}</Text>
            <Text style={detailItem}><strong>Prioridad:</strong> {priority}</Text>
            {/* Lista de adjuntos si existen */}
            {attachments && attachments.length > 0 && (
              <div style={{ marginTop: '12px' }}>
                <Text style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b', marginBottom: '4px' }}>
                  ARCHIVOS ADJUNTOS:
                </Text>
                {attachments.map((file, index) => (
                  <Link 
                    key={index} 
                    href={file.url} 
                    style={{ display: 'block', color: '#2563eb', fontSize: '13px', textDecoration: 'underline', marginBottom: '2px' }}
                  >
                    {file.name}
                  </Link>
                ))}
              </div>
            )}
          </Section>

          <Button
            style={button}
            href={`${process.env.NEXTAUTH_URL}/dashboard/tickets/`}
          >
            Seguir mi Ticket
          </Button>
        </Section>
        
        <Hr style={hr} />
        
        <Text style={footer}>
          Este es un acuse de recibo automático. Por favor, utiliza el Nro. de Atención para cualquier consulta futura.
        </Text>
      </Container>
    </Body>
  </Html>
);

export default NewTicketEmail;

// Estilos
const main = { backgroundColor: "#f6f9fc", fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif' };
const container = { margin: "0 auto", padding: "20px 0 48px", width: "580px" };
const header = { padding: "20px", textAlign: "center" as const };
const logo = { fontSize: "22px", fontWeight: "900", color: "#2563eb" };
const h1 = { color: "#1a1f36", fontSize: "24px", fontWeight: "700", textAlign: "center" as const, margin: "20px 0" };
const section = { backgroundColor: "#ffffff", padding: "40px", borderRadius: "12px", border: "1px solid #e6ebf1" };
const text = { color: "#525f7f", fontSize: "16px", lineHeight: "24px" };
const folioBox = { backgroundColor: "#1e293b", borderRadius: "8px", padding: "20px", textAlign: "center" as const, margin: "24px 0" };
const folioLabel = { color: "#94a3b8", fontSize: "10px", fontWeight: "bold", letterSpacing: "1px", margin: "0" };
const folioText = { color: "#ffffff", fontSize: "32px", fontWeight: "900", margin: "0", letterSpacing: "2px" };
const detailsSection = { backgroundColor: "#f8fafc", padding: "16px", borderRadius: "8px", margin: "20px 0" };
const detailItem = { color: "#475569", fontSize: "14px", margin: "8px 0" };
const button = { backgroundColor: "#2563eb", borderRadius: "6px", color: "#fff", fontSize: "16px", fontWeight: "600", textDecoration: "none", textAlign: "center" as const, display: "block", width: "100%", padding: "14px 0" };
const hr = { borderColor: "#e6ebf1", margin: "20px 0" };
const footer = { color: "#8898aa", fontSize: "12px", textAlign: "center" as const };
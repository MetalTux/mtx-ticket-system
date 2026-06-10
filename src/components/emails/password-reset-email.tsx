// src/components/emails/password-reset-email.tsx
import {
  Body,
  Button,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface PasswordResetEmailProps {
  resetLink: string;
}

export default function PasswordResetEmail({ resetLink }: PasswordResetEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Recuperación de contraseña de tu cuenta en GTSoft</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={heading}>Restablecer Contraseña</Text>
          <Text style={paragraph}>
            Hemos recibido una solicitud para cambiar la contraseña de tu cuenta. Haz clic en el botón de abajo para elegir una nueva contraseña:
          </Text>
          <Section style={btnContainer}>
            <Button style={button} href={resetLink}>
              Cambiar mi contraseña
            </Button>
          </Section>
          <Text style={paragraph}>
            Este enlace es válido por 1 hora. Si no solicitaste este cambio, puedes ignorar este correo con total seguridad. Tu contraseña no cambiará hasta que accedas al enlace y crees una nueva.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

// Estilos en línea para máxima compatibilidad con clientes de correo
const main = {
  backgroundColor: "#f6f9fc",
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "40px 20px",
  borderRadius: "8px",
  border: "1px solid #eee",
  marginTop: "40px",
  maxWidth: "500px",
};

const heading = {
  fontSize: "24px",
  letterSpacing: "-0.5px",
  lineHeight: "1.3",
  fontWeight: "800",
  color: "#0f172a",
  textAlign: "center" as const,
  marginBottom: "24px",
};

const paragraph = {
  margin: "0 0 15px",
  fontSize: "15px",
  lineHeight: "1.6",
  color: "#475569",
};

const btnContainer = {
  textAlign: "center" as const,
  marginTop: "32px",
  marginBottom: "32px",
};

const button = {
  backgroundColor: "#0ea5e9", // Color brand
  borderRadius: "6px",
  color: "#fff",
  fontSize: "15px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "14px 24px",
};
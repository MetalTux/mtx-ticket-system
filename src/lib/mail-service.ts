import { resend } from "./resend";
import { ReactElement } from "react";

export async function sendNotification({
  to,
  subject,
  component
}: {
  to: string;
  subject: string;
  component: ReactElement;
}) {
  const isDemo = process.env.APP_MODE === "DEMO";
  const adminEmail = process.env.ADMIN_EMAIL;

  // Si estamos en modo DEMO, el destinatario final siempre será el ADMIN
  const finalRecipient = isDemo ? (adminEmail || to) : to;

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.SENDER_EMAIL || 'onboarding@resend.dev',
      to: [finalRecipient],
      subject: isDemo ? `[DEMO] ${subject}` : subject,
      react: component,
    });

    if (error) {
      console.error("Error de Resend:", error);
      return { success: false };
    }

    return { success: true, data };
  } catch (err) {
    console.error("Fallo crítico de envío:", err);
    return { success: false };
  }
}
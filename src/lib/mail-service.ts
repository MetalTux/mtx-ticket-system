// src/lib/mail-service.ts
import { resend } from "./resend";
import { ReactElement } from "react";

export async function sendNotification({
  to,
  cc,
  subject,
  component
}: {
  to: string | string[];
  cc?: string | string[];
  subject: string;
  component: ReactElement;
}) {
  const isDemo = process.env.APP_MODE === "DEMO";
  const adminEmail = process.env.ADMIN_EMAIL;

  // Normalizamos a arreglos y limpiamos valores vacíos/nulos
  const toArray = (Array.isArray(to) ? to : [to]).filter(Boolean);
  const ccArray = (cc ? (Array.isArray(cc) ? cc : [cc]) : []).filter(Boolean);

  // Lógica DEMO: Redirige TO al Admin y vacía los CC para no molestar a los usuarios reales
  const finalTo = isDemo ? (adminEmail ? [adminEmail] : toArray) : toArray;
  const finalCc = isDemo ? [] : ccArray;

  // Evitamos errores de la API si no hay destinatario final
  if (finalTo.length === 0) return { success: false, error: "Sin destinatarios" };

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.SENDER_EMAIL || 'GTSoft <notificaciones@tickets.isonut.cl>',
      to: finalTo,
      ...(finalCc.length > 0 && { cc: finalCc }),
      subject: isDemo ? `[DEMO] ${subject}` : subject,
      react: component,
    });

    if (error) {
      console.error("Error de Resend:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err) {
    console.error("Fallo crítico de envío:", err);
    return { success: false };
  }
}
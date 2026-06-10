// src/lib/actions/2fa.ts
"use server";

import { auth } from "@/auth";
import db from "@/lib/db";
import * as OTPAuth from "otpauth";
import QRCode from "qrcode";
import { revalidatePath } from "next/cache";

/**
 * 1. Genera el código QR para que el usuario lo escanee
 */
export async function generate2FASecret() {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    throw new Error("No autorizado");
  }

  const userId = session.user.id;
  const email = session.user.email;

  // 1. Generar la llave criptográfica secreta (20 bytes es el estándar seguro)
  const secret = new OTPAuth.Secret({ size: 20 });
  const secretBase32 = secret.base32;
  
  // 2. Configurar el motor TOTP (Time-Based One-Time Password)
  const totp = new OTPAuth.TOTP({
    issuer: "GTSoft",
    label: email,
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret: secret
  });
  
  // 3. Transformar esa configuración en una imagen de Código QR
  const otpauthUrl = totp.toString();
  const qrCodeUrl = await QRCode.toDataURL(otpauthUrl);

  // 4. Guardamos el secreto en la BD (isTwoFactorEnabled sigue en falso)
  await db.user.update({
    where: { id: userId },
    data: { twoFactorSecret: secretBase32 },
  });

  return { secret: secretBase32, qrCodeUrl };
}

/**
 * 2. Verifica el código de 6 dígitos para confirmar y activar la protección
 */
export async function verifyAndEnable2FA(token: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("No autorizado");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { twoFactorSecret: true }
  });

  if (!user?.twoFactorSecret) {
    return { success: false, message: "No se encontró un secreto configurado." };
  }

  // Configuramos el verificador con la llave que guardamos en la base de datos
  const totp = new OTPAuth.TOTP({
    issuer: "GTSoft",
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret: OTPAuth.Secret.fromBase32(user.twoFactorSecret)
  });

  // Validamos el código ingresado (window: 1 permite un margen de error de 30 segundos por si el usuario es lento al teclear)
  const delta = totp.validate({ token, window: 1 });

  // Si delta es null, el código es inválido
  if (delta === null) {
    return { success: false, message: "El código es incorrecto o ha expirado." };
  }

  // Si pasó la prueba, ¡encendemos el 2FA oficialmente!
  await db.user.update({
    where: { id: session.user.id },
    data: { isTwoFactorEnabled: true },
  });

  revalidatePath("/dashboard/profile");
  return { success: true, message: "Autenticación en 2 pasos activada con éxito." };
}

/**
 * 3. Permite al usuario apagar el 2FA si ya no lo quiere usar
 */
export async function disable2FA() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("No autorizado");

  await db.user.update({
    where: { id: session.user.id },
    data: { 
      isTwoFactorEnabled: false,
      twoFactorSecret: null // Destruimos la llave por seguridad
    },
  });

  revalidatePath("/dashboard/profile");
  return { success: true, message: "Autenticación en 2 pasos desactivada." };
}
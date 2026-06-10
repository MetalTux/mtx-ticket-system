// src/lib/actions/auth.ts
"use server";

import { signOut } from "@/auth";
import db from "@/lib/db";
import { hash } from "bcrypt-ts";
import { redirect } from "next/navigation";
import { generatePasswordResetToken } from "@/lib/tokens";
import { resetPasswordRequestSchema, newPasswordSchema } from "@/lib/validations/auth";
import { sendNotification } from "@/lib/mail-service"; // O la ruta donde tengas tu función de enviar correos
import PasswordResetEmail from "@/components/emails/password-reset-email";

// ==========================================
// 1. CIERRE DE SESIÓN (Tu función original)
// ==========================================
export async function handleSignOut() {
  await signOut();
}

// ==========================================
// 2. RECUPERACIÓN DE CONTRASEÑA
// ==========================================

// Tipos para el estado de las acciones
export type AuthActionState = {
  errors?: Record<string, string[]>;
  message?: string | null;
  success?: boolean;
} | null;

/**
 * Solicitar la recuperación de contraseña (Paso 1)
 */
export async function requestPasswordReset(
  prevState: AuthActionState, 
  formData: FormData
): Promise<AuthActionState> {
  // Extraer datos del formulario
  const rawData = {
    email: formData.get("email"),
  };

  // Validar con Zod
  const validatedFields = resetPasswordRequestSchema.safeParse(rawData);
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Por favor, corrige los errores en el formulario.",
    };
  }

  const { email } = validatedFields.data;

  try {
    // Buscar si el usuario existe
    const user = await db.user.findUnique({ where: { email } });

    // Por seguridad, si el usuario NO existe, no avisamos al atacante.
    if (!user) {
      return {
        success: true,
        message: "Si el correo electrónico coincide con una cuenta activa, recibirás un enlace de recuperación pronto.",
      };
    }

    // Generar el token temporal
    const passwordResetToken = await generatePasswordResetToken(email);

    // Enlace de recuperación
    const resetLink = `${process.env.NEXTAUTH_URL || 'http://localhost:3000/'}auth/reset-password?token=${passwordResetToken.token}`;
    console.log("👉 [EMAIL DE RECUPERACIÓN] Enlace generado:", resetLink);

    // TODO: Aquí integrarás el envío de correo real
    await sendNotification({
      to: email,
      subject: "Recuperación de Contraseña - GTSoft",
      component: PasswordResetEmail({ resetLink })
    });
    

    return {
      success: true,
      message: "Si el correo electrónico coincide con una cuenta activa, recibirás un enlace de recuperación pronto.",
    };
  } catch (error) {
    console.error("FORGOT_PASSWORD_ERROR:", error);
    return { message: "Ocurrió un error inesperado. Inténtalo de nuevo más tarde." };
  }
}

/**
 * Ejecutar el cambio definitivo de contraseña (Paso 2)
 */
export async function executePasswordReset(
  token: string,
  prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  // Extraer datos
  const rawData = {
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  };

  // Validar contraseñas
  const validatedFields = newPasswordSchema.safeParse(rawData);
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Las contraseñas no cumplen con los requisitos mínimos o no coinciden.",
    };
  }

  const { password } = validatedFields.data;

  try {
    // 1. Buscar si el token existe
    const existingToken = await db.passwordResetToken.findUnique({
      where: { token }
    });

    if (!existingToken) {
      return { message: "El enlace de recuperación es inválido o ya ha sido utilizado." };
    }

    // 2. Verificar caducidad
    const hasExpired = new Date(existingToken.expires) < new Date();
    if (hasExpired) {
      await db.passwordResetToken.delete({ where: { id: existingToken.id } });
      return { message: "El enlace de recuperación ha expirado. Por favor, solicita uno nuevo." };
    }

    // 3. Buscar usuario
    const user = await db.user.findUnique({
      where: { email: existingToken.email }
    });

    if (!user) {
      return { message: "El usuario asociado a este enlace ya no existe en el sistema." };
    }

    // 4. Encriptar nueva clave
    const hashedPassword = await hash(password, 10);

    // 5. Transacción atómica: Actualizar y limpiar
    await db.$transaction([
      db.user.update({
        where: { id: user.id },
        data: { password: hashedPassword }
      }),
      db.passwordResetToken.delete({
        where: { id: existingToken.id }
      })
    ]);

  } catch (error) {
    console.error("RESET_PASSWORD_ERROR:", error);
    return { message: "Error interno al actualizar la contraseña." };
  }

  redirect("/auth/login?reset=success");
}
// src/lib/tokens.ts
import db from "@/lib/db";
import crypto from "crypto";

export const generatePasswordResetToken = async (email: string) => {
  // 1. Generar un token criptográfico seguro de 64 caracteres
  const token = crypto.randomBytes(32).toString("hex");
  
  // 2. Definir la expiración (1 hora a partir de este momento)
  const expires = new Date(new Date().getTime() + 3600 * 1000);

  // 3. Verificar si ya existe un token para este correo
  const existingToken = await db.passwordResetToken.findFirst({
    where: { email }
  });

  // 4. Si existe, lo eliminamos para evitar duplicados y conflictos
  if (existingToken) {
    await db.passwordResetToken.delete({
      where: { id: existingToken.id }
    });
  }

  // 5. Crear y guardar el nuevo token en la base de datos
  const passwordResetToken = await db.passwordResetToken.create({
    data: {
      email,
      token,
      expires,
    }
  });

  return passwordResetToken;
};
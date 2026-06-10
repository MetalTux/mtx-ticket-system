// src/lib/actions/profile.ts
"use server";

import { auth } from "@/auth";
import db from "@/lib/db";
import { compare, hash } from "bcrypt-ts";
import { changePasswordSchema } from "@/lib/validations/auth";

export type ProfileActionState = {
  errors?: Record<string, string[]>;
  message?: string | null;
  success?: boolean;
} | null;

export async function changePassword(
  prevState: ProfileActionState,
  formData: FormData
): Promise<ProfileActionState> {
  // 1. Verificar que el usuario tenga sesión activa
  const session = await auth();
  if (!session?.user?.id) {
    return { message: "No autorizado." };
  }

  // 2. Extraer y validar los datos del formulario
  const rawData = {
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  };

  const validatedFields = changePasswordSchema.safeParse(rawData);
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Por favor, corrige los errores en el formulario.",
    };
  }

  const { currentPassword, newPassword } = validatedFields.data;

  try {
    // 3. Buscar al usuario en la BD para obtener su hash actual
    const user = await db.user.findUnique({
      where: { id: session.user.id }
    });

    if (!user || !user.password) {
      return { message: "Usuario no encontrado o no válido." };
    }

    // 4. Verificar que la "Contraseña Actual" ingresada sea correcta
    const isPasswordValid = await compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return { message: "La contraseña actual es incorrecta." };
    }

    // 5. Encriptar la nueva contraseña y guardarla
    const hashedNewPassword = await hash(newPassword, 10);

    await db.user.update({
      where: { id: user.id },
      data: { password: hashedNewPassword }
    });

    return {
      success: true,
      message: "Tu contraseña ha sido actualizada con éxito.",
    };

  } catch (error) {
    console.error("CHANGE_PASSWORD_ERROR:", error);
    return { message: "Ocurrió un error inesperado al cambiar la contraseña." };
  }
}
// src/lib/validations/auth.ts
import { z } from "zod";

// Validar el formulario de "Olvidé mi contraseña"
export const resetPasswordRequestSchema = z.object({
  email: z.string().email("Por favor, ingresa un correo electrónico válido."),
});

// Validar el formulario de "Crear nueva contraseña"
export const newPasswordSchema = z.object({
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres."),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden.",
  path: ["confirmPassword"], // El error se mostrará en este campo
});
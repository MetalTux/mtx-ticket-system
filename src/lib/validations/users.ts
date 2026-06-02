// src/lib/validations/users.ts
import { z } from "zod";
import { Role } from "@prisma/client";

// Esquema base para los datos del usuario
const userBaseSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  email: z.string().email("Formato de correo inválido"),
  // Usamos 'message' tal como nos indica tu versión de Zod
  role: z.nativeEnum(Role, { message: "Rol inválido" }),
  isActive: z.boolean().default(true),
  allowedCategories: z.array(z.string()).default([]), 
});

// Esquema para creación (password obligatorio)
export const createUserSchema = userBaseSchema.extend({
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

// Esquema para actualización (password opcional)
export const updateUserSchema = userBaseSchema.extend({
  password: z.string().optional().refine(val => !val || val.length >= 6, {
    message: "La contraseña debe tener al menos 6 caracteres si decides cambiarla",
  }),
});
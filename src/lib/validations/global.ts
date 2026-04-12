// src/lib/validations/global.ts
import { z } from "zod";

export const providerSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3, "El nombre de la empresa es muy corto"),
  isActive: z.preprocess((val) => val === 'true' || val === 'on' || val === true, z.boolean()).optional().default(true),
  // Datos para el admin inicial (solo requeridos en creación)
  adminName: z.string().min(3, "Nombre del admin requerido").optional(),
  adminEmail: z.string().email("Email inválido").optional(),
  password: z.string().min(6, "La clave debe tener al menos 6 caracteres").optional(),
});
// src/lib/validations/masters.ts
import { z } from "zod";

export const statusSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "El nombre es muy corto"),
  systemKey: z.string()
    .min(2, "Key requerida")
    .regex(/^[A-Z0-9_]+$/, "Solo mayúsculas, números y guiones bajos"),
  color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Color hex inválido"),
  order: z.coerce.number().int().default(0),
  // Corregido: z.boolean() y .optional() porque si el checkbox está desmarcado, no viaja en el FormData
  isActive: z.preprocess((val) => val === 'true' || val === 'on' || val === true, z.boolean()).optional().default(true),
});

export const prioritySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Nombre requerido"),
  systemKey: z.string()
    .min(2, "Key requerida")
    .regex(/^[A-Z0-9_]+$/, "Solo mayúsculas, números y guiones bajos"),
  color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Color hex inválido"),
  weight: z.coerce.number().int().default(0),
  isActive: z.preprocess((val) => val === 'true' || val === 'on' || val === true, z.boolean()).optional().default(true),
});

export const categorySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Nombre requerido"),
  prefix: z.string()
    .min(2, "Mínimo 2 caracteres")
    .max(5, "Máximo 5 caracteres")
    .transform(v => v.toUpperCase()),
  isActive: z.preprocess((val) => val === 'true' || val === 'on' || val === true, z.boolean()).optional().default(true),
});
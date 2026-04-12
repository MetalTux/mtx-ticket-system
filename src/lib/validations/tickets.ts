// src/lib/validations/tickets.ts
import { z } from "zod";

// Esquema para la creación de tickets
export const ticketSchema = z.object({
  title: z.string().min(5, "El título debe tener al menos 5 caracteres").max(100),
  description: z.string().min(10, "La descripción es muy corta"),
  priorityId: z.string().min(1, "La prioridad es obligatoria"),
  categoryId: z.string().min(1, "La categoría es obligatoria"),
  clientId: z.string().min(1, "La empresa cliente es obligatoria"),
  attachments: z.array(z.object({
    name: z.string(),
    url: z.string().url()
  })).optional(),
});

// Esquema para actualizaciones
export const updateTicketSchema = z.object({
  ticketId: z.string(),
  comment: z.string().min(1, "El comentario no puede estar vacío"),
  statusId: z.string().optional(),
  priorityId: z.string().optional(),
  categoryId: z.string().optional(),
  assignedToId: z.string().nullable().optional(),
  isInternal: z.boolean().default(false),
});
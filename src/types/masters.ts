// src/types/masters.ts
import { TicketStatus, TicketPriority, TicketCategory } from "@prisma/client";

export type MasterType = 'status' | 'priority' | 'category';
export type AnyMaster = TicketStatus | TicketPriority | TicketCategory;

// Interfaz para el objeto que devuelve getTicketMasters()
export interface TicketMastersResponse {
  statuses: TicketStatus[];
  priorities: TicketPriority[];
  categories: TicketCategory[];
}
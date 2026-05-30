// src/types/masters.ts
import { TicketStatus, TicketPriority, TicketCategory, SupportLevel, AttentionType } from "@prisma/client";

export type MasterType = 'status' | 'priority' | 'category' | 'supportLevel' | 'attentionType';
export type AnyMaster = TicketStatus | TicketPriority | TicketCategory | SupportLevel | AttentionType;

// Interfaz para el objeto que devuelve getTicketMasters()
export interface TicketMastersResponse {
  statuses: TicketStatus[];
  priorities: TicketPriority[];
  categories: TicketCategory[];
  supportLevels: SupportLevel[];
  attentionTypes: AttentionType[];
}
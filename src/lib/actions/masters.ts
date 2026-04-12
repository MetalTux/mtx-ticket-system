// src/lib/actions/masters.ts
"use server";

import db from "@/lib/db";
import { auth } from "@/auth";

export async function getTicketMasters() {
  const session = await auth();
  const providerId = session?.user?.providerId;

  if (!providerId) return { error: "No autorizado" };

  try {
    const [statuses, priorities, categories] = await Promise.all([
      db.ticketStatus.findMany({
        where: { providerId },
        orderBy: { order: 'asc' }
      }),
      db.ticketPriority.findMany({
        where: { providerId },
        orderBy: { weight: 'desc' }
      }),
      db.ticketCategory.findMany({
        where: { providerId },
        orderBy: { name: 'asc' }
      })
    ]);

    return { statuses, priorities, categories };
  } catch (error) {
    return { error: "Error al cargar maestros" };
  }
}

export async function getClientCompanies() {
  const session = await auth();
  const providerId = session?.user?.providerId;

  if (!providerId) return [];

  try {
    return await db.clientCompany.findMany({
      where: { 
        providerId: providerId,
        isActive: true 
      },
      orderBy: { name: 'asc' }
    });
  } catch (error) {
    console.error("GET_CLIENTS_ERROR:", error);
    return [];
  }
}
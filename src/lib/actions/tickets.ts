// src/lib/actions/tickets.ts
"use server";

import { auth } from "@/auth";
import db from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Priority, TicketStatus, Category } from "@prisma/client";

export async function createTicket(formData: FormData) {
  const session = await auth();
  if (!session?.user || !session.user.id) throw new Error("No autorizado");

  const clientId = formData.get("clientId") as string;
  const formCreatorId = formData.get("creatorId") as string;
  const createdById = session.user.id; 
  const creatorId = formCreatorId || session.user.id;

  const attachmentsRaw = formData.get("attachments") as string;
  const attachments = attachmentsRaw ? JSON.parse(attachmentsRaw) : [];

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const priority = formData.get("priority") as Priority;
  const category = formData.get("category") as Category;

  if (!clientId) throw new Error("Debe seleccionar una empresa cliente.");

  // Lógica de Proveedor
  const providerId = session.user.providerId;
  let finalProviderId: string;

  if (!providerId) {
    const mainProvider = await db.providerCompany.findFirst();
    if (!mainProvider) throw new Error("No se encontró una empresa proveedora.");
    finalProviderId = mainProvider.id;
  } else {
    finalProviderId = providerId;
  }

  // --- INICIO DE TRANSACCIÓN PARA EL FOLIO ---
  const result = await db.$transaction(async (tx) => {
    // 1. Obtener y aumentar el contador para la categoría específica
    // El upsert asegura que si la categoría es nueva, empiece en 1
    const seq = await tx.ticketSequence.upsert({
      where: { category },
      update: { nextVal: { increment: 1 } },
      create: { category, nextVal: 2 },
    });

    // Calculamos el número actual (si nextVal es 2, el actual es 1)
    const currentNum = seq.nextVal === 2 ? 1 : seq.nextVal - 1;
    
    // Generamos el Folio: S-000001, D-000001, etc.
    const prefix = category.charAt(0).toUpperCase();
    const folio = `${prefix}-${String(currentNum).padStart(6, '0')}`;

    // 2. Crear el Ticket con todos tus datos originales + Folio
    return await tx.ticket.create({
      data: {
        folio,
        sequence: currentNum,
        title,
        description,
        priority,
        category,
        status: TicketStatus.PENDIENTE,
        creatorId,
        createdById,
        clientId,
        providerId: finalProviderId,
        attachments,
      },
    });
  });

  revalidatePath("/dashboard/tickets");
  revalidatePath("/dashboard"); // Revalidamos el Kanban también
  redirect("/dashboard/tickets");
}

export async function addTicketUpdate(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("No autorizado");
  if (!session?.user.id) throw new Error("No autorizado");

  const ticketId = formData.get("ticketId") as string;
  const comment = formData.get("comment") as string;
  const status = formData.get("status") as TicketStatus;
  const attachmentsRaw = formData.get("attachments") as string;
  const isInternal = formData.get("isInternal") === "true";

  const attachments = attachmentsRaw ? JSON.parse(attachmentsRaw) : [];

  await db.$transaction([
    // 1. Crear el registro en el historial/comentarios
    db.ticketHistory.create({
      data: {
        ticketId,
        userId: session.user.id!,
        status,
        comment,
        attachments,
        isInternal,
      }
    }),
    // 2. Actualizar el ticket principal (nuevo estado)
    db.ticket.update({
      where: { id: ticketId },
      data: { status }
    })
  ]);

  revalidatePath(`/dashboard/tickets/${ticketId}`);
}

export async function updateTicketFull(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("No autorizado");
  if (!session?.user.id) throw new Error("No autorizado");

  const ticketId = formData.get("ticketId") as string;
  const comment = formData.get("comment") as string;
  const status = formData.get("status") as TicketStatus;
  const priority = formData.get("priority") as Priority;
  const category = formData.get("category") as Category;
  const assignedToId = formData.get("assignedToId") as string || null;
  const isInternal = formData.get("isInternal") === "true";
  const attachments = JSON.parse(formData.get("attachments") as string || "[]");

  await db.$transaction(async (tx) => {
    // 1. Crear el registro detallado en el historial
    await tx.ticketHistory.create({
      data: {
        ticketId,
        userId: session.user.id!,
        status,
        priority,
        category,
        assignedToId,
        comment,
        attachments,
        isInternal,
      }
    });

    // 2. Actualizar el Ticket principal con los nuevos valores
    await tx.ticket.update({
      where: { id: ticketId },
      data: {
        status,
        priority,
        category,
        assignedToId,
      }
    });
  });

  revalidatePath(`/dashboard/tickets/${ticketId}`);
}

export async function updateTicketStatusQuick(
  ticketId: string, 
  newStatus: TicketStatus
) {
  const session = await auth();
  if (!session?.user) throw new Error("No autorizado");

  try {
    await db.$transaction(async (tx) => {
      // 1. Actualizar el ticket
      await tx.ticket.update({
        where: { id: ticketId },
        data: { status: newStatus },
      });

      // 2. Registrar en el historial que se movió vía Kanban
      await tx.ticketHistory.create({
        data: {
          ticketId,
          userId: session.user.id!,
          comment: `Estado actualizado a **${newStatus}** mediante el Tablero Kanban.`,
          isInternal: true, // Lo marcamos como interno para que el cliente no se sature de notificaciones de movimiento
          status: newStatus,
        },
      });
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error al mover ticket:", error);
    return { success: false, error: "No se pudo actualizar el estado" };
  }
}
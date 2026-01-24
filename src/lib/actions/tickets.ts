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
  
  // Lógica de distinción:
  // El 'registrador' siempre es el usuario logueado.
  const createdById = session.user.id; 
  
  // El 'solicitante' es el que se eligió en el select, 
  // o el mismo usuario si se está creando su propio ticket.
  const creatorId = formCreatorId || session.user.id;

  const attachmentsRaw = formData.get("attachments") as string;
  const attachments = attachmentsRaw ? JSON.parse(attachmentsRaw) : [];

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const priority = formData.get("priority") as Priority;
  const category = formData.get("category") as Category;

  if (!clientId) throw new Error("Debe seleccionar una empresa cliente.");

  const providerId = session.user.providerId;
  let finalProviderId;

  if (!providerId) {
    const mainProvider = await db.providerCompany.findFirst();
    if (!mainProvider) throw new Error("No se encontró una empresa proveedora configurada.");
    finalProviderId = mainProvider.id;
  } else {
    finalProviderId = providerId;
  }

  await db.ticket.create({
    data: {
      title,
      description,
      priority,
      category,
      status: TicketStatus.PENDIENTE,
      creatorId: creatorId,     // El contacto del cliente
      createdById: createdById, // El agente de soporte
      clientId: clientId,
      providerId: finalProviderId,
      attachments: attachments,
    },
  });

  revalidatePath("/dashboard/tickets");
  redirect("/dashboard/tickets");
}

export async function addTicketUpdate(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("No autorizado");

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
        userId: session.user.id,
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
        userId: session.user.id,
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
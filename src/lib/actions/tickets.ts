// src/lib/actions/tickets.ts
"use server";

import { auth } from "@/auth";
import db from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { sendNotification } from "@/lib/mail-service";
import { NewTicketEmail } from "@/emails/NewTicketEmail";
import { TicketReplyEmail } from "@/emails/TicketReplyEmail";
import { TicketResolvedEmail } from "@/emails/TicketResolvedEmail";
import { ticketSchema, updateTicketSchema } from "@/lib/validations/tickets";

export type CreateTicketState = {
  errors?: {
    title?: string[];
    description?: string[];
    priorityId?: string[];
    categoryId?: string[];
    clientId?: string[];
    attentionTypeId?: string[]; // NUEVO: Soluciona el error del Formulario
    attachments?: string[];
  };
  message?: string | null;
  success?: boolean;
} | null;

export type UpdateTicketState = {
  errors?: {
    ticketId?: string[];
    comment?: string[];
    statusId?: string[];
    priorityId?: string[];
    categoryId?: string[];
    assignedToId?: string[];
    isInternal?: string[];
    timeAnalysis?: string[]; // NUEVO
    timeDev?: string[];      // NUEVO
    timeSupport?: string[];  // NUEVO
    timeUpdate?: string[];   // NUEVO
  };
  message?: string | null;
  success?: boolean;
} | null;

export async function createTicket(prevState: CreateTicketState, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id || !session.user.providerId) {
    throw new Error("No autorizado");
  }

  const providerId = session.user.providerId;

  const rawData = {
    title: formData.get("title") as string,
    description: formData.get("description") as string,
    priorityId: formData.get("priorityId") as string,
    categoryId: formData.get("categoryId") as string,
    clientId: formData.get("clientId") as string,
    attentionTypeId: (formData.get("attentionTypeId") as string) || undefined, // Extracción
    attachments: JSON.parse((formData.get("attachments") as string) || "[]"),
  };

  const validatedFields = ticketSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Por favor, revisa los campos marcados en rojo.",
    };
  }

  const { title, description, priorityId, categoryId, clientId, attentionTypeId, attachments } = validatedFields.data;

  const formCreatorId = formData.get("creatorId") as string;
  const createdById = session.user.id;
  const creatorId = formCreatorId || session.user.id;

  try {
    const result = await db.$transaction(async (tx) => {
      const category = await tx.ticketCategory.findUnique({ where: { id: categoryId } });
      if (!category) throw new Error("Categoría no válida");

      const seq = await tx.ticketSequence.upsert({
        where: { id: categoryId },
        update: { nextVal: { increment: 1 } },
        create: { categoryId: categoryId, nextVal: 2 },
      });

      const currentNum = seq.nextVal === 2 ? 1 : seq.nextVal - 1;
      const folio = `${category.prefix}-${String(currentNum).padStart(6, '0')}`;

      const initialStatus = await tx.ticketStatus.findUnique({
        where: { providerId_systemKey: { providerId, systemKey: 'OPEN' } }
      });
      if (!initialStatus) throw new Error("Configuración de estados incompleta (OPEN)");

      const ticket = await tx.ticket.create({
        data: {
          folio,
          sequence: currentNum,
          title,
          description,
          statusId: initialStatus.id,
          priorityId,
          categoryId,
          attentionTypeId, // GUARDAR EN BD
          creatorId,
          createdById,
          clientId,
          providerId,
          attachments: attachments as Prisma.InputJsonValue,
        },
        include: { creator: true, priority: true, category: true },
      });

      await tx.ticketHistory.create({
        data: {
          ticketId: ticket.id,
          userId: createdById,
          statusId: initialStatus.id,
          priorityId,
          categoryId,
          attentionTypeId, // GUARDAR EN HISTORIAL INICIAL
          comment: "Ticket aperturado en el sistema bajo normativa GTSoft.",
        }
      });

      return ticket;
    });

    if (result?.creator.email) {
      sendNotification({
        to: result.creator.email,
        subject: `🎫 Confirmación de Ticket: ${result.folio}`,
        component: NewTicketEmail({
          folio: result.folio,
          title: result.title,
          category: result.category.name,
          priority: result.priority.name,
          userName: result.creator.name || "Usuario",
          ticketId: result.id, 
          attachments: result.attachments as { name: string; url: string }[]
        }),
      }).catch(err => console.error("Error enviando correo:", err));
    }
  } catch (error) {
    console.error("CREATE_TICKET_ERROR:", error);
    return { message: "Error interno al procesar el ticket en base de datos." };
  }

  revalidatePath("/dashboard/tickets");
  revalidatePath("/dashboard");
  redirect("/dashboard/tickets");
}

export async function addTicketUpdate(prevState: UpdateTicketState, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("No autorizado");

  // 1. Extraemos y validamos usando el mismo escudo Zod
  const rawData = {
    ticketId: formData.get("ticketId") as string,
    comment: formData.get("comment") as string,
    statusId: formData.get("statusId") as string,
    isInternal: formData.get("isInternal") === "true",
    timeAnalysis: formData.get("timeAnalysis"),
    timeDev: formData.get("timeDev"),
    timeSupport: formData.get("timeSupport"),
    timeUpdate: formData.get("timeUpdate"),
  };

  const validatedFields = updateTicketSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Error de validación en la respuesta rápida.",
    };
  }

  const data = validatedFields.data;
  const attachments = JSON.parse((formData.get("attachments") as string) || "[]") as Prisma.InputJsonValue;

  try {
    const ticketDetails = await db.$transaction(async (tx) => {
      // 1. Crear historial CON TIEMPOS
      await tx.ticketHistory.create({
        data: { 
          ticketId: data.ticketId, 
          userId: session.user.id!, 
          statusId: data.statusId!, 
          comment: data.comment, 
          attachments, 
          isInternal: data.isInternal,
          timeAnalysis: data.timeAnalysis,
          timeDev: data.timeDev,
          timeSupport: data.timeSupport,
          timeUpdate: data.timeUpdate
        }
      });

      // 2. Actualizar ticket
      return await tx.ticket.update({
        where: { id: data.ticketId },
        data: { statusId: data.statusId },
        include: { creator: true, assignedTo: true, status: true }
      });
    });

    // 3. ENVÍO DE CORREO
    if (!data.isInternal) {
      const isCreator = session.user.id === ticketDetails.creatorId;
      const recipientEmail = isCreator ? ticketDetails.assignedTo?.email : ticketDetails.creator?.email;
      
      if (recipientEmail) {
        sendNotification({
          to: recipientEmail,
          subject: `Actualización en tu ticket: ${ticketDetails.folio}`,
          component: TicketReplyEmail({
            folio: ticketDetails.folio,
            ticketTitle: ticketDetails.title,
            authorName: session.user.name || "Equipo GTSoft",
            message: data.comment,
            ticketId: ticketDetails.id
          })
        }).catch(e => console.error("Error correo reply:", e));
      }
    }

    revalidatePath(`/dashboard/tickets/${data.ticketId}`);
    return { success: true };
  } catch (error) {
    console.error("ADD_UPDATE_ERROR:", error);
    return { message: "Error al agregar comentario rápido" };
  }
}

export async function updateTicketFull(prevState: UpdateTicketState, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("No autorizado");

  // Extracción de datos crudos
  const rawData = {
    ticketId: formData.get("ticketId"),
    comment: formData.get("comment"),
    statusId: formData.get("statusId"),
    priorityId: formData.get("priorityId"),
    categoryId: formData.get("categoryId"),
    assignedToId: formData.get("assignedToId") || null,
    isInternal: formData.get("isInternal") === "true",
    timeAnalysis: formData.get("timeAnalysis"), // NUEVOS
    timeDev: formData.get("timeDev"),
    timeSupport: formData.get("timeSupport"),
    timeUpdate: formData.get("timeUpdate"),
  };

  const validatedFields = updateTicketSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Error de validación en los datos de actualización.",
    };
  }

  const data = validatedFields.data;
  const attachments = JSON.parse((formData.get("attachments") as string) || "[]") as Prisma.InputJsonValue;
  const sendEmail = formData.get("sendEmailNotification") === "true";

  try {
    const updatedTicket = await db.$transaction(async (tx) => {
      // Registrar el historial CON LOS TIEMPOS
      await tx.ticketHistory.create({
        data: {
          ticketId: data.ticketId,
          userId: session.user.id!,
          statusId: data.statusId!,
          priorityId: data.priorityId,
          categoryId: data.categoryId,
          assignedToId: data.assignedToId,
          comment: data.comment,
          attachments,
          isInternal: data.isInternal,
          timeAnalysis: data.timeAnalysis, // GUARDAR TIEMPOS
          timeDev: data.timeDev,
          timeSupport: data.timeSupport,
          timeUpdate: data.timeUpdate,
        }
      });

      return await tx.ticket.update({
        where: { id: data.ticketId },
        data: {
          statusId: data.statusId,
          priorityId: data.priorityId,
          categoryId: data.categoryId,
          assignedToId: data.assignedToId,
        },
        include: { creator: true, status: true }
      });
    });

    if (sendEmail && !data.isInternal && updatedTicket.creator?.email) {
      if (updatedTicket.status.systemKey === "RESOLVED" || updatedTicket.status.systemKey === "CLOSED") {
        sendNotification({
          to: updatedTicket.creator.email,
          subject: `✅ Ticket Finalizado: ${updatedTicket.folio}`,
          component: TicketResolvedEmail({
            folio: updatedTicket.folio,
            title: updatedTicket.title,
            userName: updatedTicket.creator.name || "Usuario",
            solutionSummary: data.comment,
            ticketId: updatedTicket.id
          })
        }).catch(e => console.error("Error correo resolución:", e));
      } else {
        sendNotification({
          to: updatedTicket.creator.email,
          subject: `Actualización de estado: ${updatedTicket.folio}`,
          component: TicketReplyEmail({
            folio: updatedTicket.folio,
            ticketTitle: updatedTicket.title,
            authorName: "Soporte Técnico",
            message: `El estado del ticket ha cambiado. Notas: ${data.comment}`,
            ticketId: updatedTicket.id
          })
        }).catch(e => console.error("Error correo update full:", e));
      }
    }

    revalidatePath(`/dashboard/tickets/${data.ticketId}`);
    return { success: true, message: "Ticket actualizado con éxito." };
  } catch (error) {
    console.error("UPDATE_FULL_ERROR:", error);
    return { message: "Error al procesar la actualización completa." };
  }
}

export async function updateTicketStatusQuick(
  ticketId: string, 
  newStatusKeyOrId: string,
  assignedToId?: string
) {
  try {
    const session = await auth();
    if (!session?.user?.id || !session.user.providerId) return { error: "No autorizado" };

    const targetStatus = await db.ticketStatus.findFirst({
      where: {
        providerId: session.user.providerId,
        OR: [
          { id: newStatusKeyOrId },
          { name: newStatusKeyOrId },
          { systemKey: newStatusKeyOrId.toUpperCase() }
        ]
      }
    });

    if (!targetStatus) return { error: "Estado no encontrado" };

    const dataToUpdate: Prisma.TicketUpdateInput = {
      status: { connect: { id: targetStatus.id } },
      updatedAt: new Date(),
    };

    if (assignedToId) {
      dataToUpdate.assignedTo = { connect: { id: assignedToId } };
    }

    const updatedTicket = await db.ticket.update({
      where: { id: ticketId },
      data: dataToUpdate,
    });

    await db.ticketHistory.create({
      data: {
        ticketId,
        userId: session.user.id!,
        statusId: targetStatus.id,
        comment: `Cambio de estado rápido a: ${targetStatus.name}${assignedToId ? ' con asignación de especialista' : ''}.`,
        isInternal: true,
      }
    });

    revalidatePath("/dashboard");
    revalidatePath(`/dashboard/tickets/${ticketId}`);
    return { success: true, ticket: updatedTicket };
  } catch (error) {
    return { error: "Error interno en la actualización rápida." };
  }
}
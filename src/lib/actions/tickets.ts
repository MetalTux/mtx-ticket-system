// src/lib/actions/tickets.ts
"use server";

import { auth } from "@/auth";
import db from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { sendNotification } from "../mail-service";
import { NewTicketEmail } from "@/emails/NewTicketEmail";
import { TicketReplyEmail } from "@/emails/TicketReplyEmail";
import { TicketResolvedEmail } from "@/emails/TicketResolvedEmail";
import { TicketUpdateEmail } from "@/emails/TicketUpdateEmail";
import { TicketAssignedEmail } from "@/emails/TicketAssignedEmail";
import { ticketSchema, updateTicketSchema } from "@/lib/validations/tickets";

export type CreateTicketState = {
  errors?: {
    title?: string[];
    description?: string[];
    priorityId?: string[];
    categoryId?: string[];
    clientId?: string[];
    attentionTypeId?: string[];
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
    assignedToId?: string[];
    isInternal?: string[];
    timeAnalysis?: string[]; 
    timeDev?: string[];      
    timeSupport?: string[];  
    timeUpdate?: string[];   
  };
  message?: string | null;
  success?: boolean;
} | null;

// =========================================================================
// MOTOR DE RUTEO DE CORREOS: Centraliza la búsqueda de involucrados
// =========================================================================
async function getTicketStakeholders(ticketId: string) {
  const ticket = await db.ticket.findUnique({
    where: { id: ticketId },
    include: {
      creator: true,       // El contacto que requiere la ayuda (Cliente)
      createdBy: true,     // El usuario que registró el ticket en el sistema
      assignedTo: true,    // El técnico responsable
      category: {
        include: {
          allowedUsers: {
            where: { isActive: true },
            select: { email: true }
          }
        }
      },
      priority: true,
    }
  });

  if (!ticket) throw new Error("Ticket no encontrado");

  return {
    clientEmail: ticket.creator?.email,
    creatorEmail: ticket.createdBy?.email,
    assignedEmail: ticket.assignedTo?.email,
    areaEmails: ticket.category?.allowedUsers.map(u => u.email).filter(Boolean) as string[],
    ticket
  };
}

// =========================================================================
// ACCIONES DE BASE DE DATOS
// =========================================================================

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
    attentionTypeId: (formData.get("attentionTypeId") as string) || undefined,
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
        where: { providerId_categoryId: { providerId, categoryId } },
        update: { nextVal: { increment: 1 } },
        create: { providerId, categoryId, nextVal: 2 },
      });

      const currentNum = seq.nextVal === 2 ? 1 : seq.nextVal - 1;
      const folio = `${category.prefix}-${String(currentNum).padStart(6, '0')}`;

      const initialStatus = await tx.ticketStatus.findUnique({
        where: { providerId_systemKey: { providerId, systemKey: 'OPEN' } }
      });
      if (!initialStatus) throw new Error("Configuración de estados incompleta (OPEN)");

      const ticket = await tx.ticket.create({
        data: {
          folio, sequence: currentNum, title, description,
          statusId: initialStatus.id, priorityId, categoryId, attentionTypeId,
          creatorId, createdById, clientId, providerId,
          attachments: attachments as Prisma.InputJsonValue,
        }
      });

      await tx.ticketHistory.create({
        data: {
          ticketId: ticket.id, userId: createdById, statusId: initialStatus.id,
          priorityId, categoryId, attentionTypeId,
          comment: "Ticket aperturado en el sistema bajo normativa MTX.",
        }
      });

      return ticket;
    });

    // REGLA 1: Creación de Ticket
    // TO: Cliente | CC: Creador (si es distinto) + Usuarios del Área
    const st = await getTicketStakeholders(result.id);
    const ccList = new Set<string>(st.areaEmails);
    
    if (st.creatorEmail && st.creatorEmail !== st.clientEmail) ccList.add(st.creatorEmail);
    if (st.clientEmail) ccList.delete(st.clientEmail); // Evitar duplicados en TO y CC

    if (st.clientEmail) {
      sendNotification({
        to: st.clientEmail,
        cc: Array.from(ccList),
        subject: `🎫 Confirmación de Ticket: ${st.ticket.folio}`,
        component: NewTicketEmail({
          folio: st.ticket.folio,
          title: st.ticket.title,
          category: st.ticket.category.name,
          priority: st.ticket.priority.name,
          userName: st.ticket.creator.name || "Usuario",
          ticketId: st.ticket.id, 
          attachments: st.ticket.attachments as { name: string; url: string }[]
        }),
      }).catch(err => console.error("Error enviando correo creación:", err));
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
    return { errors: validatedFields.error.flatten().fieldErrors, message: "Error de validación." };
  }

  const data = validatedFields.data;
  const attachments = JSON.parse((formData.get("attachments") as string) || "[]") as Prisma.InputJsonValue;

  try {
    await db.$transaction(async (tx) => {
      await tx.ticketHistory.create({
        data: { 
          ticketId: data.ticketId, userId: session.user.id!, statusId: data.statusId!, 
          comment: data.comment, attachments, isInternal: data.isInternal,
          timeAnalysis: data.timeAnalysis, timeDev: data.timeDev,
          timeSupport: data.timeSupport, timeUpdate: data.timeUpdate
        }
      });
      return await tx.ticket.update({
        where: { id: data.ticketId },
        data: { statusId: data.statusId }
      });
    });

    // REGLA 2: Actualización (Nuevo Comentario)
    // TO: Cliente | CC: Creador + Asignado + Usuarios del Área
    if (!data.isInternal) {
      const st = await getTicketStakeholders(data.ticketId as string);
      const ccList = new Set<string>(st.areaEmails);
      
      if (st.creatorEmail) ccList.add(st.creatorEmail);
      if (st.assignedEmail) ccList.add(st.assignedEmail);
      if (st.clientEmail) ccList.delete(st.clientEmail);

      if (st.clientEmail) {
        sendNotification({
          to: st.clientEmail,
          cc: Array.from(ccList),
          subject: `Actualización en tu ticket: ${st.ticket.folio}`,
          component: TicketReplyEmail({
            folio: st.ticket.folio,
            ticketTitle: st.ticket.title,
            authorName: session.user.name || "Equipo MTX",
            message: data.comment,
            ticketId: st.ticket.id
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

  const rawData = {
    ticketId: formData.get("ticketId"),
    comment: formData.get("comment"),
    statusId: formData.get("statusId"),
    priorityId: formData.get("priorityId"),
    assignedToId: formData.get("assignedToId") || null,
    isInternal: formData.get("isInternal") === "true",
    timeAnalysis: formData.get("timeAnalysis"),
    timeDev: formData.get("timeDev"),
    timeSupport: formData.get("timeSupport"),
    timeUpdate: formData.get("timeUpdate"),
  };

  const validatedFields = updateTicketSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors, message: "Error de validación." };
  }

  const data = validatedFields.data;
  const attachments = JSON.parse((formData.get("attachments") as string) || "[]") as Prisma.InputJsonValue;
  const sendEmail = formData.get("sendEmailNotification") === "true";

  try {
    const oldTicket = await db.ticket.findUnique({ where: { id: data.ticketId as string }});
    const isNewAssignment = data.assignedToId && data.assignedToId !== oldTicket?.assignedToId;

    const updatedTicket = await db.$transaction(async (tx) => {
      await tx.ticketHistory.create({
        data: {
          ticketId: data.ticketId, userId: session.user.id!, statusId: data.statusId!,
          priorityId: data.priorityId, assignedToId: data.assignedToId,
          comment: data.comment, attachments, isInternal: data.isInternal,
          timeAnalysis: data.timeAnalysis, timeDev: data.timeDev,
          timeSupport: data.timeSupport, timeUpdate: data.timeUpdate,
        }
      });

      return await tx.ticket.update({
        where: { id: data.ticketId },
        data: { statusId: data.statusId, priorityId: data.priorityId, assignedToId: data.assignedToId },
        include: { status: true }
      });
    });

    const st = await getTicketStakeholders(data.ticketId as string);

    // REGLA 3: Escalar Ticket (Nueva asignación)
    // TO: Usuario Asignado | CC: Usuarios del Área
    if (isNewAssignment && st.assignedEmail) {
       const assignCcList = new Set<string>(st.areaEmails);
       assignCcList.delete(st.assignedEmail); 
       
       sendNotification({
         to: st.assignedEmail,
         cc: Array.from(assignCcList),
         subject: `📌 Nuevo Ticket Asignado: ${updatedTicket.folio}`,
         component: TicketAssignedEmail({
           folio: updatedTicket.folio,
           title: updatedTicket.title,
           assignedToName: st.ticket.assignedTo?.name || "Especialista",
           assignedByName: session.user.name || "Administrador",
           ticketId: updatedTicket.id
         })
       }).catch(e => console.error("Error correo asignación:", e));
    }

    // REGLA 2 y 4: Actualización General y Cierre
    // TO: Cliente | CC: Creador + Asignado + Usuarios del Área
    if (sendEmail && !data.isInternal && st.clientEmail) {
      const ccList = new Set<string>(st.areaEmails);
      if (st.creatorEmail) ccList.add(st.creatorEmail);
      if (st.assignedEmail) ccList.add(st.assignedEmail);
      ccList.delete(st.clientEmail);

      const isClosed = updatedTicket.status.systemKey === "RESOLVED" || updatedTicket.status.systemKey === "CLOSED";

      if (isClosed) {
        sendNotification({
          to: st.clientEmail,
          cc: Array.from(ccList),
          subject: `✅ Ticket Finalizado: ${updatedTicket.folio}`,
          component: TicketResolvedEmail({
            folio: updatedTicket.folio,
            title: updatedTicket.title,
            userName: st.ticket.creator.name || "Usuario",
            solutionSummary: data.comment,
            ticketId: updatedTicket.id
          })
        }).catch(e => console.error("Error correo resolución:", e));
      } else {
        sendNotification({
          to: st.clientEmail,
          cc: Array.from(ccList),
          subject: `Actualización de estado: ${updatedTicket.folio}`,
          component: TicketUpdateEmail({
            folio: updatedTicket.folio,
            title: updatedTicket.title,
            newStatus: updatedTicket.status.name,
            updatedBy: session.user.name || "Equipo MTX",
            comment: data.comment
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

// =========================================================================
// ACTUALIZACIÓN RÁPIDA (USO INTERNO - SIN CORREOS)
// =========================================================================
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
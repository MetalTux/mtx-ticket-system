// src/lib/actions/tickets.ts
"use server";

import { auth } from "@/auth";
import db from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { sendNotification } from "@/lib/mail-service";
import { NewTicketEmail } from "@/emails/NewTicketEmail";
import { ticketSchema, updateTicketSchema } from "@/lib/validations/tickets";

/**
 * Helper para buscar Master Data por System Key.
 * Protege la lógica de negocio contra cambios en los nombres visuales.
 */
async function getStatusBySystemKey(key: string, providerId: string) {
  return await db.ticketStatus.findUnique({
    where: { providerId_systemKey: { providerId, systemKey: key } }
  });
}

// Definimos el tipo del estado para que el Escudo sea 100% sólido
export type CreateTicketState = {
  errors?: {
    title?: string[];
    description?: string[];
    priorityId?: string[];
    categoryId?: string[];
    clientId?: string[];
    attachments?: string[];
  };
  message?: string | null;
  success?: boolean;
} | null;

// Definimos el tipo para que coincida con lo que Zod devuelve al aplanar los errores
export type UpdateTicketState = {
  errors?: {
    ticketId?: string[];
    comment?: string[];
    statusId?: string[];
    priorityId?: string[];
    categoryId?: string[];
    assignedToId?: string[];
    isInternal?: string[];
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

  // 1. Preparación de datos para el Escudo (Zod)
  const rawData = {
    title: formData.get("title") as string,
    description: formData.get("description") as string,
    priorityId: formData.get("priorityId") as string,
    categoryId: formData.get("categoryId") as string,
    clientId: formData.get("clientId") as string,
    attachments: JSON.parse((formData.get("attachments") as string) || "[]"),
  };

  // 2. Validación
  const validatedFields = ticketSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Por favor, revisa los campos marcados en rojo.",
    };
  }

  const { title, description, priorityId, categoryId, clientId, attachments } = validatedFields.data;

  // Datos de autoría
  const formCreatorId = formData.get("creatorId") as string;
  const createdById = session.user.id;
  const creatorId = formCreatorId || session.user.id;

  // --- TRANSACCIÓN PARA EL FOLIO Y CREACIÓN ---
  try {
    const result = await db.$transaction(async (tx) => {
      // 1. Obtener datos de la categoría para el Prefijo
      const category = await tx.ticketCategory.findUnique({
        where: { id: categoryId }
      });
      if (!category) throw new Error("Categoría no válida");

      // 2. Manejo de Secuencia atómica
      const seq = await tx.ticketSequence.upsert({
        where: { id: categoryId },
        update: { nextVal: { increment: 1 } },
        create: { categoryId: categoryId, nextVal: 2 },
      });

      const currentNum = seq.nextVal === 2 ? 1 : seq.nextVal - 1;
      const folio = `${category.prefix}-${String(currentNum).padStart(6, '0')}`;

      // 3. Obtener el Status inicial (OPEN)
      const initialStatus = await tx.ticketStatus.findUnique({
        where: { providerId_systemKey: { providerId, systemKey: 'OPEN' } }
      });
      if (!initialStatus) throw new Error("Configuración de estados incompleta (OPEN)");

      // 4. Crear el Ticket
      const ticket = await tx.ticket.create({
        data: {
          folio,
          sequence: currentNum,
          title,
          description,
          statusId: initialStatus.id,
          priorityId,
          categoryId,
          creatorId,
          createdById,
          clientId,
          providerId,
          attachments: attachments as Prisma.InputJsonValue,
        },
        include: { 
          creator: true,
          priority: true,
          category: true
        },
      });

      // 5. Historial inicial
      await tx.ticketHistory.create({
        data: {
          ticketId: ticket.id,
          userId: createdById,
          statusId: initialStatus.id,
          priorityId,
          categoryId,
          comment: "Ticket aperturado en el sistema bajo normativa GTSoft.",
        }
      });

      return ticket;
    });

    // 3. NOTIFICACIÓN (Fuera de la transacción)
    if (result?.creator.email) {
      await sendNotification({
        to: result.creator.email,
        subject: `Confirmación de Ticket: ${result.folio}`,
        component: NewTicketEmail({
          folio: result.folio,
          title: result.title,
          category: result.category.name,
          priority: result.priority.name,
          userName: result.creator.name || "Usuario",
          attachments: result.attachments as { name: string; url: string }[]
        }),
      });
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

  const ticketId = formData.get("ticketId") as string;
  const comment = formData.get("comment") as string;
  const statusId = formData.get("statusId") as string;
  const isInternal = formData.get("isInternal") === "true";
  const attachments = JSON.parse((formData.get("attachments") as string) || "[]") as Prisma.InputJsonValue;

  if (!comment) return { error: "El comentario es obligatorio" };

  await db.$transaction(async (tx) => {
    // 1. Crear historial
    await tx.ticketHistory.create({
      data: {
        ticketId,
        userId: session.user.id!,
        statusId,
        comment,
        attachments,
        isInternal,
      }
    });

    // 2. Actualizar ticket
    await tx.ticket.update({
      where: { id: ticketId },
      data: { statusId }
    });
  });

  revalidatePath(`/dashboard/tickets/${ticketId}`);
  return { success: true };
}

export async function updateTicketFull(prevState: UpdateTicketState, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("No autorizado");

  // 1. Validación con Escudo
  const rawData = {
    ticketId: formData.get("ticketId") as string,
    comment: formData.get("comment") as string,
    statusId: formData.get("statusId") as string,
    priorityId: formData.get("priorityId") as string,
    categoryId: formData.get("categoryId") as string,
    assignedToId: (formData.get("assignedToId") as string) || null,
    isInternal: formData.get("isInternal") === "true",
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
    await db.$transaction(async (tx) => {
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
        }
      });

      await tx.ticket.update({
        where: { id: data.ticketId },
        data: {
          statusId: data.statusId,
          priorityId: data.priorityId,
          categoryId: data.categoryId,
          assignedToId: data.assignedToId,
        }
      });
    });

    if (sendEmail && !data.isInternal) {
      console.log("Simulación: Notificación de actualización enviada.");
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
    console.error("QUICK_UPDATE_ERROR:", error);
    return { error: "Error interno en la actualización rápida." };
  }
}



// // src/lib/actions/tickets.ts
// "use server";

// import { auth } from "@/auth";
// import db from "@/lib/db";
// import { revalidatePath } from "next/cache";
// import { redirect } from "next/navigation";
// import { Prisma } from "@prisma/client";
// import { sendNotification } from "@/lib/mail-service";
// import { NewTicketEmail } from "@/emails/NewTicketEmail";

// // --- HELPERS PARA BUSCAR MASTER DATA POR SYSTEM KEY ---
// // Esto evita usar IDs quemados y mantiene la lógica de negocio blindada.
// async function getStatusBySystemKey(key: string, providerId: string) {
//   return await db.ticketStatus.findUnique({
//     where: { providerId_systemKey: { providerId, systemKey: key } }
//   });
// }

// export async function createTicket(formData: FormData) {
//   const session = await auth();
//   if (!session?.user?.id || !session.user.providerId) throw new Error("No autorizado");

//   const providerId = session.user.providerId;
//   const clientId = formData.get("clientId") as string;
//   const formCreatorId = formData.get("creatorId") as string;
//   const createdById = session.user.id; 
//   const creatorId = formCreatorId || session.user.id;

//   const attachmentsRaw = formData.get("attachments") as string;
//   const attachments = attachmentsRaw ? JSON.parse(attachmentsRaw) : [];

//   const title = formData.get("title") as string;
//   const description = formData.get("description") as string;
  
//   // Ahora recibimos IDs de las tablas maestras desde el formulario
//   const priorityId = formData.get("priorityId") as string;
//   const categoryId = formData.get("categoryId") as string;

//   if (!clientId) throw new Error("Debe seleccionar una empresa cliente.");

//   // --- TRANSACCIÓN PARA EL FOLIO Y CREACIÓN ---
//   const result = await db.$transaction(async (tx) => {
//     // 1. Obtener datos de la categoría para el Prefijo
//     const category = await tx.ticketCategory.findUnique({
//       where: { id: categoryId }
//     });
//     if (!category) throw new Error("Categoría no válida");

//     // 2. Manejo de Secuencia atómica
//     const seq = await tx.ticketSequence.upsert({
//       where: { id: categoryId },
//       update: { nextVal: { increment: 1 } },
//       create: { categoryId: categoryId, nextVal: 2 },
//     });

//     const currentNum = seq.nextVal === 2 ? 1 : seq.nextVal - 1;
//     const folio = `${category.prefix}-${String(currentNum).padStart(6, '0')}`;

//     // 3. Obtener el Status inicial (OPEN)
//     const initialStatus = await tx.ticketStatus.findUnique({
//       where: { providerId_systemKey: { providerId, systemKey: 'OPEN' } }
//     });
//     if (!initialStatus) throw new Error("Configuración de estados incompleta (OPEN)");

//     // 4. Crear el Ticket
//     const ticket = await tx.ticket.create({
//       data: {
//         folio,
//         sequence: currentNum,
//         title,
//         description,
//         statusId: initialStatus.id,
//         priorityId,
//         categoryId,
//         creatorId,
//         createdById,
//         clientId,
//         providerId,
//         attachments,
//       },
//       include: { 
//         creator: true,
//         priority: true,
//         category: true
//       },
//     });

//     // 5. Historial inicial
//     await tx.ticketHistory.create({
//       data: {
//         ticketId: ticket.id,
//         userId: createdById,
//         statusId: initialStatus.id,
//         priorityId,
//         categoryId,
//         comment: "Ticket aperturado en el sistema.",
//       }
//     });

//     return ticket;
//   });

//   // NOTIFICACIÓN
//   if (result?.creator.email) {
//     await sendNotification({
//       to: result.creator.email,
//       subject: `Confirmación de Ticket: ${result.folio}`,
//       component: NewTicketEmail({
//         folio: result.folio,
//         title: result.title,
//         category: result.category.name,
//         priority: result.priority.name,
//         userName: result.creator.name || "Usuario",
//         attachments: result.attachments as { name: string; url: string }[]
//       }),
//     });
//   }

//   revalidatePath("/dashboard/tickets");
//   revalidatePath("/dashboard");
//   redirect("/dashboard/tickets");
// }

// export async function addTicketUpdate(formData: FormData) {
//   const session = await auth();
//   if (!session?.user?.id) throw new Error("No autorizado");

//   const ticketId = formData.get("ticketId") as string;
//   const comment = formData.get("comment") as string;
//   const statusId = formData.get("statusId") as string;
//   const isInternal = formData.get("isInternal") === "true";
//   const attachments = JSON.parse(formData.get("attachments") as string || "[]");

//   await db.$transaction(async (tx) => {
//     // 1. Crear historial
//     await tx.ticketHistory.create({
//       data: {
//         ticketId,
//         userId: session.user.id!,
//         statusId,
//         comment,
//         attachments,
//         isInternal,
//       }
//     });

//     // 2. Actualizar ticket
//     await tx.ticket.update({
//       where: { id: ticketId },
//       data: { statusId }
//     });
//   });

//   revalidatePath(`/dashboard/tickets/${ticketId}`);
// }

// export async function updateTicketFull(formData: FormData) {
//   const session = await auth();
//   if (!session?.user?.id) throw new Error("No autorizado");

//   const ticketId = formData.get("ticketId") as string;
//   const comment = formData.get("comment") as string;
//   const statusId = formData.get("statusId") as string;
//   const priorityId = formData.get("priorityId") as string;
//   const categoryId = formData.get("categoryId") as string;
//   const assignedToId = formData.get("assignedToId") as string || null;
//   const isInternal = formData.get("isInternal") === "true";
//   const attachments = JSON.parse(formData.get("attachments") as string || "[]");
//   const sendEmail = formData.get("sendEmailNotification") === "true";

//   await db.$transaction(async (tx) => {
//     await tx.ticketHistory.create({
//       data: {
//         ticketId,
//         userId: session.user.id!,
//         statusId,
//         priorityId,
//         categoryId,
//         assignedToId,
//         comment,
//         attachments,
//         isInternal,
//       }
//     });

//     await tx.ticket.update({
//       where: { id: ticketId },
//       data: {
//         statusId,
//         priorityId,
//         categoryId,
//         assignedToId,
//       }
//     });
//   });

//   revalidatePath(`/dashboard/tickets/${ticketId}`);
//   return { success: "Ticket actualizado" };
// }

// export async function updateTicketStatusQuick(
//   ticketId: string, 
//   newStatusKeyOrId: string, // Puede ser el nombre (del Kanban) o el ID
//   assignedToId?: string
// ) {
//   try {
//     const session = await auth();
//     if (!session?.user?.id || !session.user.providerId) return { error: "No autorizado" };

//     // Buscamos el objeto Status. Intentamos por ID primero, luego por SystemKey o Name
//     const targetStatus = await db.ticketStatus.findFirst({
//       where: {
//         providerId: session.user.providerId,
//         OR: [
//           { id: newStatusKeyOrId },
//           { name: newStatusKeyOrId },
//           { systemKey: newStatusKeyOrId.toUpperCase() }
//         ]
//       }
//     });

//     if (!targetStatus) return { error: "Estado no encontrado" };

//     const dataToUpdate: Prisma.TicketUpdateInput = {
//       status: { connect: { id: targetStatus.id } },
//       updatedAt: new Date(),
//     };

//     if (assignedToId) {
//       dataToUpdate.assignedTo = { connect: { id: assignedToId } };
//     }

//     const updatedTicket = await db.ticket.update({
//       where: { id: ticketId },
//       data: dataToUpdate,
//     });

//     await db.ticketHistory.create({
//       data: {
//         ticketId,
//         userId: session.user.id!,
//         statusId: targetStatus.id,
//         comment: `Cambio de estado rápido a: ${targetStatus.name}${assignedToId ? ' con asignación de especialista' : ''}.`,
//         isInternal: true,
//       }
//     });

//     revalidatePath("/dashboard");
//     revalidatePath(`/dashboard/tickets/${ticketId}`);
//     return { success: true, ticket: updatedTicket };
//   } catch (error) {
//     console.error("QUICK_UPDATE_ERROR:", error);
//     return { error: "Error interno" };
//   }
// }

// // src/lib/actions/tickets.ts
// "use server";

// import { auth } from "@/auth";
// import db from "@/lib/db";
// import { revalidatePath } from "next/cache";
// import { redirect } from "next/navigation";
// import { Priority, TicketStatus, Category, Prisma } from "@prisma/client";
// import { resend } from "@/lib/resend";
// import { sendNotification } from "@/lib/mail-service";
// import { TicketUpdateEmail } from "@/emails/TicketUpdateEmail";
// import { NewTicketEmail } from "@/emails/NewTicketEmail";
// import { CATEGORY_LABELS, PRIORITY_LABELS } from "@/enums/constantes";

// export async function createTicket(formData: FormData) {
//   const session = await auth();
//   if (!session?.user || !session.user.id) throw new Error("No autorizado");

//   const clientId = formData.get("clientId") as string;
//   const formCreatorId = formData.get("creatorId") as string;
//   const createdById = session.user.id; 
//   const creatorId = formCreatorId || session.user.id;

//   const attachmentsRaw = formData.get("attachments") as string;
//   const attachments = attachmentsRaw ? JSON.parse(attachmentsRaw) : [];

//   const title = formData.get("title") as string;
//   const description = formData.get("description") as string;
//   const priority = formData.get("priority") as Priority;
//   const category = formData.get("category") as Category;

//   if (!clientId) throw new Error("Debe seleccionar una empresa cliente.");

//   // Lógica de Proveedor
//   const providerId = session.user.providerId;
//   let finalProviderId: string;

//   if (!providerId) {
//     const mainProvider = await db.providerCompany.findFirst();
//     if (!mainProvider) throw new Error("No se encontró una empresa proveedora.");
//     finalProviderId = mainProvider.id;
//   } else {
//     finalProviderId = providerId;
//   }

//   // --- INICIO DE TRANSACCIÓN PARA EL FOLIO ---
//   const result = await db.$transaction(async (tx) => {
//     // 1. Obtener y aumentar el contador para la categoría específica
//     // El upsert asegura que si la categoría es nueva, empiece en 1
//     const seq = await tx.ticketSequence.upsert({
//       where: { category },
//       update: { nextVal: { increment: 1 } },
//       create: { category, nextVal: 2 },
//     });

//     // Calculamos el número actual (si nextVal es 2, el actual es 1)
//     const currentNum = seq.nextVal === 2 ? 1 : seq.nextVal - 1;
    
//     // Generamos el Folio: S-000001, D-000001, etc.
//     const prefix = category.charAt(0).toUpperCase();
//     const folio = `${prefix}-${String(currentNum).padStart(6, '0')}`;

//     // 2. Crear el Ticket con todos tus datos originales + Folio
//     return await tx.ticket.create({
//       data: {
//         folio,
//         sequence: currentNum,
//         title,
//         description,
//         priority,
//         category,
//         status: TicketStatus.PENDIENTE,
//         creatorId,
//         createdById,
//         clientId,
//         providerId: finalProviderId,
//         attachments,
//       },
//       include: { creator: true },
//     });
//   });

//   // 2. DISPARAR NOTIFICACIÓN (Fuera de la transacción para no ralentizar la BD)
//   if (result?.creator.email) {
//     // Usamos void para no bloquear el redirect, o un try-catch silencioso
//     await sendNotification({
//       to: result.creator.email,
//       subject: `Confirmación de Ticket: ${result.folio}`,
//       component: NewTicketEmail({
//         folio: result.folio,
//         title: result.title,
//         category: CATEGORY_LABELS[result.category],
//         priority: PRIORITY_LABELS[result.priority],
//         userName: result.creator.name || "Usuario",
//         attachments: result.attachments as { name: string; url: string }[]
//       }),
//     });
//   }

//   revalidatePath("/dashboard/tickets");
//   revalidatePath("/dashboard"); // Revalidamos el Kanban también
//   redirect("/dashboard/tickets");
// }

// export async function addTicketUpdate(formData: FormData) {
//   const session = await auth();
//   if (!session?.user) throw new Error("No autorizado");
//   if (!session?.user.id) throw new Error("No autorizado");

//   const ticketId = formData.get("ticketId") as string;
//   const comment = formData.get("comment") as string;
//   const status = formData.get("status") as TicketStatus;
//   const attachmentsRaw = formData.get("attachments") as string;
//   const isInternal = formData.get("isInternal") === "true";

//   const attachments = attachmentsRaw ? JSON.parse(attachmentsRaw) : [];

//   await db.$transaction([
//     // 1. Crear el registro en el historial/comentarios
//     db.ticketHistory.create({
//       data: {
//         ticketId,
//         userId: session.user.id!,
//         status,
//         comment,
//         attachments,
//         isInternal,
//       }
//     }),
//     // 2. Actualizar el ticket principal (nuevo estado)
//     db.ticket.update({
//       where: { id: ticketId },
//       data: { status }
//     })
//   ]);

//   revalidatePath(`/dashboard/tickets/${ticketId}`);
// }

// export async function updateTicketFull(formData: FormData) {
//   const session = await auth();
//   if (!session?.user) throw new Error("No autorizado");
//   if (!session?.user.id) throw new Error("No autorizado");

//   const ticketId = formData.get("ticketId") as string;
//   const comment = formData.get("comment") as string;
//   const status = formData.get("status") as TicketStatus;
//   const priority = formData.get("priority") as Priority;
//   const category = formData.get("category") as Category;
//   const assignedToId = formData.get("assignedToId") as string || null;
//   const isInternal = formData.get("isInternal") === "true";
//   const attachments = JSON.parse(formData.get("attachments") as string || "[]");
//   const sendEmail = formData.get("sendEmailNotification") === "true";

//   await db.$transaction(async (tx) => {
//     // 1. Crear el registro detallado en el historial
//     await tx.ticketHistory.create({
//       data: {
//         ticketId,
//         userId: session.user.id!,
//         status,
//         priority,
//         category,
//         assignedToId,
//         comment,
//         attachments,
//         isInternal,
//       }
//     });

//     // 2. Actualizar el Ticket principal con los nuevos valores
//     await tx.ticket.update({
//       where: { id: ticketId },
//       data: {
//         status,
//         priority,
//         category,
//         assignedToId,
//       }
//     });
//   });

//   // ENVÍO DE CORREO CONDICIONAL
//   if (sendEmail && !isInternal) {
//     // Solo enviamos si el checkbox está marcado Y no es una nota interna
//     try {
//       // await sendUpdateNotificationEmail(ticketId, comment); 
//       console.log("Notificación enviada por email correctamente.");
//     } catch (error) {
//       console.error("Error al enviar email:", error);
//     }
//   }

//   revalidatePath(`/dashboard/tickets/${ticketId}`);
//   return { success: "Ticket actualizado" };
// }

// export async function updateTicketStatusQuick(
//   ticketId: string, 
//   newStatus: TicketStatus,
//   assignedToId?: string
// ) {
//   try {
//     const session = await auth();
//     if (!session?.user) return { error: "No autorizado" };

//     // Definimos el objeto con el tipo de actualización generado por Prisma
//     const dataToUpdate: Prisma.TicketUpdateInput = {
//       status: newStatus,
//       updatedAt: new Date(),
//     };

//     // Si hay asignación, usamos la conexión correcta de Prisma
//     if (assignedToId) {
//       dataToUpdate.assignedTo = {
//         connect: { id: assignedToId }
//       };
//     }

//     const updatedTicket = await db.ticket.update({
//       where: { id: ticketId },
//       data: dataToUpdate,
//     });

//     // Registramos en el historial. 
//     // Agregamos 'status' porque tu esquema lo marca como obligatorio.
//     await db.ticketHistory.create({
//       data: {
//         ticketId,
//         userId: session.user.id!,
//         status: newStatus, // <--- Esto resuelve el error del status missing
//         comment: `Estado actualizado a ${newStatus}${assignedToId ? ' y asignado a un nuevo especialista' : ''}.`,
//         isInternal: true,
//       }
//     });

//     revalidatePath("/dashboard");
//     return { success: true, ticket: updatedTicket };
//   } catch (error) {
//     console.error("Error updating ticket status:", error);
//     return { error: "Error interno del servidor" };
//   }
// }
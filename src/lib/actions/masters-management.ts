// src/lib/actions/masters-management.ts
"use server";

import { auth } from "@/auth";
import db from "@/lib/db";
import { revalidatePath } from "next/cache";
import { statusSchema, prioritySchema, categorySchema } from "@/lib/validations/masters";
import { Prisma } from "@prisma/client";

// --- MANTENEDOR DE ESTADOS ---
export async function saveStatus(formData: FormData) {
  const session = await auth();
  const providerId = session?.user?.providerId;
  if (!providerId || session.user.role !== "ADMIN") throw new Error("No autorizado");

  const rawData = Object.fromEntries(formData.entries());
  const dataToValidate = {
    ...rawData,
    isActive: rawData.isActive === 'on' || rawData.isActive === 'true',
  };

  const validated = statusSchema.safeParse(dataToValidate);
  if (!validated.success) return { errors: validated.error.flatten().fieldErrors };

  const { id, ...data } = validated.data;

  try {
    if (id) {
      await db.ticketStatus.update({ where: { id, providerId }, data: { ...data } });
    } else {
      await db.ticketStatus.create({ data: { ...data, providerId } });
    }
    revalidatePath("/dashboard/settings/tickets");
    return { success: true };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') return { message: "La Key de Sistema ya está en uso." };
    return { message: "Error inesperado al guardar el estado." };
  }
}

// --- MANTENEDOR DE PRIORIDADES ---
export async function savePriority(formData: FormData) {
  const session = await auth();
  const providerId = session?.user?.providerId;
  if (!providerId || session.user.role !== "ADMIN") throw new Error("No autorizado");

  const rawData = Object.fromEntries(formData.entries());
  const dataToValidate = {
    ...rawData,
    isActive: rawData.isActive === 'on' || rawData.isActive === 'true',
  };

  const validated = prioritySchema.safeParse(dataToValidate);
  if (!validated.success) return { errors: validated.error.flatten().fieldErrors };

  const { id, ...data } = validated.data;

  try {
    if (id) {
      await db.ticketPriority.update({ where: { id, providerId }, data: { ...data } });
    } else {
      await db.ticketPriority.create({ data: { ...data, providerId } });
    }
    revalidatePath("/dashboard/settings/tickets");
    return { success: true };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') return { message: "La Key de Sistema ya está en uso." };
    return { message: "Error inesperado al guardar la prioridad." };
  }
}

// --- MANTENEDOR DE CATEGORÍAS ---
export async function saveCategory(formData: FormData) {
  const session = await auth();
  const providerId = session?.user?.providerId;
  if (!providerId || session.user.role !== "ADMIN") throw new Error("No autorizado");

  const rawData = Object.fromEntries(formData.entries());
  const dataToValidate = {
    ...rawData,
    isActive: rawData.isActive === 'on' || rawData.isActive === 'true',
  };

  const validated = categorySchema.safeParse(dataToValidate);
  if (!validated.success) return { errors: validated.error.flatten().fieldErrors };

  const { id, ...data } = validated.data;

  try {
    if (id) {
      await db.ticketCategory.update({
        where: { id, providerId },
        data: { name: data.name, prefix: data.prefix, isActive: data.isActive }
      });
    } else {
      await db.ticketCategory.create({ data: { ...data, providerId } });
    }
    revalidatePath("/dashboard/settings/tickets");
    return { success: true };
  } catch (error) {
    return { message: "Error al guardar la categoría." };
  }
}

// --- NUEVO: MANTENEDOR DE NIVELES DE SOPORTE ---
export async function saveSupportLevel(formData: FormData) {
  const session = await auth();
  const providerId = session?.user?.providerId;
  if (!providerId || session.user.role !== "ADMIN") throw new Error("No autorizado");

  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  
  const data = {
    name,
    description,
    isActive: formData.get("isActive") === 'on',
    showTimeAnalysis: formData.get("showTimeAnalysis") === 'on',
    showTimeDev: formData.get("showTimeDev") === 'on',
    showTimeSupport: formData.get("showTimeSupport") === 'on',
    showTimeUpdate: formData.get("showTimeUpdate") === 'on',
  };

  if (!name) return { message: "El nombre es obligatorio" };

  try {
    if (id) {
      await db.supportLevel.update({ where: { id, providerId }, data });
    } else {
      await db.supportLevel.create({ data: { ...data, providerId } });
    }
    revalidatePath("/dashboard/settings/tickets");
    return { success: true };
  } catch (error) {
    return { message: "Error al guardar el nivel de soporte." };
  }
}

// --- NUEVO: MANTENEDOR DE TIPOS DE ATENCIÓN ---
export async function saveAttentionType(formData: FormData) {
  const session = await auth();
  const providerId = session?.user?.providerId;
  if (!providerId || session.user.role !== "ADMIN") throw new Error("No autorizado");

  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const systemKey = formData.get("systemKey") as string;
  const isActive = formData.get("isActive") === 'on';

  if (!name || !systemKey) return { message: "Nombre y Key son obligatorios" };

  try {
    if (id) {
      await db.attentionType.update({
        where: { id, providerId },
        data: { name, systemKey, isActive }
      });
    } else {
      await db.attentionType.create({ data: { name, systemKey, isActive, providerId } });
    }
    revalidatePath("/dashboard/settings/tickets");
    return { success: true };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') return { message: "La Key ya está en uso." };
    return { message: "Error al guardar el tipo de atención." };
  }
}

// --- LÓGICA DE ACTIVACIÓN / DESACTIVACIÓN ---
type MasterType = 'status' | 'priority' | 'category' | 'supportLevel' | 'attentionType';

export async function toggleMasterStatus(type: MasterType, id: string, currentStatus: boolean) {
  const session = await auth();
  const providerId = session?.user?.providerId;
  if (!providerId || session?.user?.role !== "ADMIN") throw new Error("No autorizado");

  const data = { isActive: !currentStatus };
  const where = { id, providerId };

  try {
    if (type === 'status') await db.ticketStatus.update({ where, data });
    if (type === 'priority') await db.ticketPriority.update({ where, data });
    if (type === 'category') await db.ticketCategory.update({ where, data });
    if (type === 'supportLevel') await db.supportLevel.update({ where, data });
    if (type === 'attentionType') await db.attentionType.update({ where, data });

    revalidatePath("/dashboard/settings/tickets");
    return { success: true };
  } catch (error) {
    return { error: "No se pudo cambiar el estado." };
  }
}

// --- ELIMINACIÓN FÍSICA ---
export async function deleteMaster(type: MasterType, id: string) {
  const session = await auth();
  const providerId = session?.user?.providerId;
  if (!providerId || session?.user?.role !== "ADMIN") throw new Error("No autorizado");

  // Validaciones de uso antes de eliminar
  let inUse = null;
  if (type === 'status') inUse = await db.ticket.findFirst({ where: { statusId: id, providerId } });
  if (type === 'priority') inUse = await db.ticket.findFirst({ where: { priorityId: id, providerId } });
  if (type === 'category') inUse = await db.ticket.findFirst({ where: { categoryId: id, providerId } });
  if (type === 'supportLevel') inUse = await db.clientCompany.findFirst({ where: { supportLevelId: id, providerId } });
  if (type === 'attentionType') inUse = await db.ticket.findFirst({ where: { attentionTypeId: id, providerId } });

  if (inUse) {
    return { error: "⚠️ No se puede eliminar: Existen registros que usan esta configuración." };
  }

  const where = { id, providerId };

  try {
    if (type === 'status') await db.ticketStatus.delete({ where });
    if (type === 'priority') await db.ticketPriority.delete({ where });
    if (type === 'category') await db.ticketCategory.delete({ where });
    if (type === 'supportLevel') await db.supportLevel.delete({ where });
    if (type === 'attentionType') await db.attentionType.delete({ where });

    revalidatePath("/dashboard/settings/tickets");
    return { success: true };
  } catch (error) {
    return { error: "Error al intentar eliminar el registro." };
  }
}
// src/lib/actions/masters-management.ts
"use server";

import { auth } from "@/auth";
import db from "@/lib/db";
import { revalidatePath } from "next/cache";
import { statusSchema, prioritySchema, categorySchema } from "@/lib/validations/masters";
import { Prisma } from "@prisma/client"; // Importamos Prisma para los tipos de error

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
      await db.ticketStatus.update({
        where: { id, providerId },
        data: { ...data }
      });
    } else {
      await db.ticketStatus.create({
        data: { ...data, providerId }
      });
    }

    revalidatePath("/dashboard/settings/tickets");
    return { success: true };
  } catch (error) {
    // Verificamos si es un error conocido de Prisma (como llave única duplicada)
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') return { message: "La Key de Sistema ya está en uso." };
    }
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
      await db.ticketPriority.update({
        where: { id, providerId },
        data: { ...data }
      });
    } else {
      await db.ticketPriority.create({
        data: { ...data, providerId }
      });
    }

    revalidatePath("/dashboard/settings/tickets");
    return { success: true };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') return { message: "La Key de Sistema ya está en uso." };
    }
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
      await db.ticketCategory.create({
        data: { ...data, providerId }
      });
    }

    revalidatePath("/dashboard/settings/tickets");
    return { success: true };
  } catch (error) {
    return { message: "Error al guardar la categoría." };
  }
}

// --- LÓGICA DE ACTIVACIÓN / DESACTIVACIÓN ---
type MasterType = 'status' | 'priority' | 'category';

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

  const whereInUse = type === 'status' ? { statusId: id } : type === 'priority' ? { priorityId: id } : { categoryId: id };
  const inUse = await db.ticket.findFirst({ where: { ...whereInUse, providerId } });

  if (inUse) {
    return { error: "⚠️ No se puede eliminar: Existen tickets que usan este registro." };
  }

  const where = { id, providerId };

  try {
    if (type === 'status') await db.ticketStatus.delete({ where });
    if (type === 'priority') await db.ticketPriority.delete({ where });
    if (type === 'category') await db.ticketCategory.delete({ where });

    revalidatePath("/dashboard/settings/tickets");
    return { success: true };
  } catch (error) {
    return { error: "Error al intentar eliminar el registro." };
  }
}
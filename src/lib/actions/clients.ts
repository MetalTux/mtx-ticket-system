// src/lib/actions/clients.ts
"use server";

import db from "@/lib/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function createClientCompany(formData: FormData) {
  const session = await auth();
  if (!session?.user || session.user.role === "CONTACTO_CLIENTE") return { error: "No autorizado" };

  const name = formData.get("name") as string;
  const supportLevelId = formData.get("supportLevelId") as string;
  const monthlyMinutesStr = formData.get("monthlyMinutes") as string;
  
  const providerId = session.user.providerId;

  if (!name || !providerId) return { error: "Datos incompletos" };

  const dataToSave = {
    name,
    providerId,
    supportLevelId: supportLevelId === "none" || !supportLevelId ? null : supportLevelId,
    monthlyMinutes: monthlyMinutesStr ? parseInt(monthlyMinutesStr, 10) : 0
  };

  try {
    await db.clientCompany.create({ data: dataToSave });
    revalidatePath("/dashboard/clients");
    return { success: "Empresa creada exitosamente" };
  } catch (e) {
    return { error: "Error al crear la empresa" };
  }
}

export async function updateClientCompany(id: string, formData: FormData) {
  const name = formData.get("name") as string;
  const isActive = formData.get("isActive") === "on";
  const supportLevelId = formData.get("supportLevelId") as string;
  const monthlyMinutesStr = formData.get("monthlyMinutes") as string;

  const dataToSave = {
    name,
    isActive,
    supportLevelId: supportLevelId === "none" || !supportLevelId ? null : supportLevelId,
    monthlyMinutes: monthlyMinutesStr ? parseInt(monthlyMinutesStr, 10) : 0
  };

  try {
    await db.clientCompany.update({
      where: { id },
      data: dataToSave,
    });
    revalidatePath("/dashboard/clients");
    return { success: "Información actualizada" };
  } catch (e) {
    return { error: "Error al actualizar" };
  }
}

export async function deleteClientCompany(id: string) {
  try {
    const ticketCount = await db.ticket.count({ where: { clientId: id } });
    if (ticketCount > 0) {
      await db.clientCompany.update({
        where: { id },
        data: { isActive: false },
      });
      revalidatePath("/dashboard/clients");
      return { info: "Empresa desactivada (tiene tickets asociados)" };
    }
    await db.clientCompany.delete({ where: { id } });
    revalidatePath("/dashboard/clients");
    return { success: "Empresa eliminada definitivamente" };
  } catch (e) {
    return { error: "Error en la operación" };
  }
}
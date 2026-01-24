// src/lib/actions/contacts.ts
"use server";

import db from "@/lib/db";
import { revalidatePath } from "next/cache";
import { hash } from "bcrypt-ts"; // Cambiado a bcrypt-ts
import { Prisma } from "@prisma/client";

export async function createContact(clientId: string, formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const existingUser = await db.user.findUnique({ where: { email } });
  if (existingUser) return { error: "El email ya está registrado" };

  const client = await db.clientCompany.findUnique({ where: { id: clientId } });
  if (!client) return { error: "Empresa no encontrada" };
  
  const hashedPassword = await hash(password, 10);

  try {
    await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "CONTACTO_CLIENTE",
        clientId: clientId,
        providerId: client.providerId,
      },
    });
    revalidatePath(`/dashboard/clients/${clientId}`);
    return { success: "Contacto creado" };
  } catch (e) {
    return { error: "Error al guardar contacto" };
  }
}

export async function updateContact(id: string, clientId: string, formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const isActive = formData.get("isActive") === "on";

  const data: Prisma.UserUpdateInput = { name, email, isActive };

  if (password && password.trim() !== "") {
    data.password = await hash(password, 10);
  }

  try {
    await db.user.update({ where: { id }, data });
    revalidatePath(`/dashboard/clients/${clientId}`);
    return { success: "Contacto actualizado" };
  } catch (error) {
    return { error: "Error: el email podría estar en uso" };
  }
}

export async function deleteContact(id: string, clientId: string) {
  const contact = await db.user.findUnique({
    where: { id },
    include: { _count: { select: { createdTickets: true } } }
  });

  try {
    if (contact && contact._count.createdTickets > 0) {
      await db.user.update({ where: { id }, data: { isActive: false } });
      revalidatePath(`/dashboard/clients/${clientId}`);
      return { info: "Contacto inhabilitado (posee historial)" };
    }
    await db.user.delete({ where: { id } });
    revalidatePath(`/dashboard/clients/${clientId}`);
    return { success: "Contacto eliminado" };
  } catch (e) {
    return { error: "Error al eliminar" };
  }
}
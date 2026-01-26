// src/lib/actions/users.ts
"use server";

import db from "@/lib/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { hash } from "bcrypt-ts"; // Usando la librería que ya tenemos
import { Role, Prisma } from "@prisma/client";

export async function createStaffUser(formData: FormData) {
  const session = await auth();
  
  // Seguridad: Solo los ADMIN de la proveedora pueden crear staff
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("No autorizado");
  }

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const role = formData.get("role") as Role;
  const providerId = session.user.providerId;

  if (!name || !email || !password || !role) {
    throw new Error("Todos los campos son obligatorios");
  }

  // 1. Validar si el email ya existe
  const existingUser = await db.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new Error("El correo electrónico ya está registrado");
  }

  // 2. Encriptar la contraseña usando bcrypt-ts (coherente con contact.ts)
  const hashedPassword = await hash(password, 10);

  // 3. Crear el usuario vinculado a la Proveedora
  await db.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role,
      providerId,
      isActive: true,
    },
  });

  revalidatePath("/dashboard/users");
  redirect("/dashboard/users");
}

export async function updateStaffUser(userId: string, formData: FormData) {
  const session = await auth();
  
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("No autorizado");
  }

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const role = formData.get("role") as Role;
  const isActive = formData.get("isActive") === "on";

  // Usamos el tipo específico que Prisma espera para una actualización de usuario
  const updateData: Prisma.UserUpdateInput = {
    name,
    email,
    role,
    isActive,
  };

  // Solo encriptamos y añadimos la password al objeto si se proporcionó una nueva
  if (password && password.length > 0) {
    updateData.password = await hash(password, 10);
  }

  try {
    await db.user.update({
      where: { id: userId },
      data: updateData,
    });
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    throw new Error("No se pudo actualizar el usuario");
  }

  revalidatePath("/dashboard/users");
  redirect("/dashboard/users");
}

export async function deleteOrDeactivateUser(userId: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "No autorizado" };
  }

  try {
    // VERIFICACIÓN MANUAL: ¿Tiene tickets asignados o creados?
    const userWithTickets = await db.user.findUnique({
      where: { id: userId },
      include: {
        _count: {
          select: {
            assignedTickets: true,
            createdTickets: true,
            historyEntries: true,
          }
        }
      }
    });

    const hasHistory = 
      (userWithTickets?._count.assignedTickets || 0) > 0 || 
      (userWithTickets?._count.createdTickets || 0) > 0 ||
      (userWithTickets?._count.historyEntries || 0) > 0;

    if (hasHistory) {
      // Si tiene historial, DESACTIVAMOS
      await db.user.update({
        where: { id: userId },
        data: { isActive: false },
      });
      revalidatePath("/dashboard/users");
      return { success: "Usuario con historial: Se ha desactivado el acceso." };
    }

    // Si NO tiene historial, ELIMINAMOS
    await db.user.delete({
      where: { id: userId },
    });
    
    revalidatePath("/dashboard/users");
    return { success: "Usuario sin historial eliminado permanentemente." };

  } catch (error) {
    console.error("Delete Error:", error);
    return { error: "No se pudo procesar la solicitud de borrado." };
  }
}
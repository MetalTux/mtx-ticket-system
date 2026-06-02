// src/lib/actions/users.ts
"use server";

import db from "@/lib/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { hash } from "bcrypt-ts"; 
import { Prisma } from "@prisma/client";
import { createUserSchema, updateUserSchema } from "@/lib/validations/users";

export type UserActionState = {
  errors?: Record<string, string[]>;
  message?: string | null;
  success?: boolean;
} | null;

export async function createStaffUser(prevState: UserActionState, formData: FormData): Promise<UserActionState> {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") return { message: "No autorizado" };

  // 1. Extraer y mapear datos
  const rawData = {
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
    // Extraemos todos los checkboxes marcados que se llamen "allowedCategories"
    allowedCategories: formData.getAll("allowedCategories"),
  };

  // 2. Validar con Zod
  const validatedFields = createUserSchema.safeParse(rawData);
  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors, message: "Revisa los campos del formulario" };
  }

  const { name, email, password, role, allowedCategories } = validatedFields.data;

  // 3. Validar email único
  const existingUser = await db.user.findUnique({ where: { email } });
  if (existingUser) return { message: "El correo electrónico ya está registrado" };

  const hashedPassword = await hash(password, 10);

  // 4. Guardar en BD con relación Muchos a Muchos
  try {
    await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        providerId: session.user.providerId,
        isActive: true,
        // Conectar las categorías seleccionadas
        allowedCategories: {
          connect: allowedCategories.map(id => ({ id }))
        }
      },
    });
  } catch (error) {
    console.error("Error al crear usuario:", error);
    return { message: "Error interno al crear el usuario" };
  }

  revalidatePath("/dashboard/users");
  redirect("/dashboard/users");
}

export async function updateStaffUser(userId: string, prevState: UserActionState, formData: FormData): Promise<UserActionState> {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") return { message: "No autorizado" };

  const rawData = {
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password") || undefined, // Si viene vacío, lo pasamos como undefined
    role: formData.get("role"),
    isActive: formData.get("isActive") === "on",
    allowedCategories: formData.getAll("allowedCategories"),
  };

  const validatedFields = updateUserSchema.safeParse(rawData);
  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors, message: "Revisa los campos del formulario" };
  }

  const { name, email, password, role, isActive, allowedCategories } = validatedFields.data;

  // Validar si cambió el email que no choque con otro
  const existingUser = await db.user.findUnique({ where: { email } });
  if (existingUser && existingUser.id !== userId) {
    return { message: "El correo electrónico ya está siendo usado por otro usuario" };
  }

  const updateData: Prisma.UserUpdateInput = {
    name,
    email,
    role,
    isActive,
    // La magia de 'set': Borra las relaciones anteriores y pone las nuevas (reemplazo total)
    allowedCategories: {
      set: allowedCategories.map(id => ({ id }))
    }
  };

  if (password) {
    updateData.password = await hash(password, 10);
  }

  try {
    await db.user.update({
      where: { id: userId },
      data: updateData,
    });
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    return { message: "No se pudo actualizar el usuario" };
  }

  revalidatePath("/dashboard/users");
  redirect("/dashboard/users");
}

export async function deleteOrDeactivateUser(userId: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") return { error: "No autorizado" };

  try {
    const userWithTickets = await db.user.findUnique({
      where: { id: userId },
      include: {
        _count: { select: { assignedTickets: true, createdTickets: true, historyEntries: true } }
      }
    });

    const hasHistory = 
      (userWithTickets?._count.assignedTickets || 0) > 0 || 
      (userWithTickets?._count.createdTickets || 0) > 0 ||
      (userWithTickets?._count.historyEntries || 0) > 0;

    if (hasHistory) {
      await db.user.update({ where: { id: userId }, data: { isActive: false } });
      revalidatePath("/dashboard/users");
      return { success: "Usuario con historial: Se ha desactivado el acceso." };
    }

    await db.user.delete({ where: { id: userId } });
    revalidatePath("/dashboard/users");
    return { success: "Usuario sin historial eliminado permanentemente." };

  } catch (error) {
    return { error: "No se pudo procesar la solicitud de borrado." };
  }
}
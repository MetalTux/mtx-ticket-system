// src/lib/actions/global-management.ts
"use server";

import { auth } from "@/auth";
import db from "@/lib/db";
import { hash } from "bcrypt-ts";
import { revalidatePath } from "next/cache";
import { providerSchema } from "@/lib/validations/global";
import { Prisma } from "@prisma/client";

export async function saveProvider(formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== "SUPER_ADMIN") throw new Error("Acceso denegado");

  const rawData = Object.fromEntries(formData.entries());
  const validated = providerSchema.safeParse(rawData);

  if (!validated.success) return { errors: validated.error.flatten().fieldErrors };

  const { id, name, isActive, adminName, adminEmail, password } = validated.data;

  try {
    if (id) {
      // SOLO ACTUALIZAR EMPRESA
      await db.providerCompany.update({
        where: { id },
        data: { name, isActive }
      });
    } else {
      // CREACIÓN ATÓMICA (EMPRESA + ADMIN)
      if (!adminEmail || !password || !adminName) {
        return { message: "Datos del administrador incompletos" };
      }

      const hashedPassword = await hash(password, 10);

      await db.$transaction(async (tx) => {
        const newProvider = await tx.providerCompany.create({
          data: { name, isActive: true }
        });

        await tx.user.create({
          data: {
            name: adminName,
            email: adminEmail,
            password: hashedPassword,
            role: "ADMIN",
            providerId: newProvider.id,
            isActive: true
          }
        });

        // Seed básico de estados para que el cliente no empiece de cero
        await tx.ticketStatus.createMany({
          data: [
            { name: "Pendiente", systemKey: "OPEN", color: "#f97316", order: 1, providerId: newProvider.id },
            { name: "En Proceso", systemKey: "IN_PROGRESS", color: "#3b82f6", order: 2, providerId: newProvider.id },
            { name: "Resuelto", systemKey: "RESOLVED", color: "#10b981", order: 3, providerId: newProvider.id },
          ]
        });
      });
    }

    revalidatePath("/dashboard/global/providers");
    return { success: true };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') return { message: "El email del administrador ya existe." };
    }
    return { message: "Error al procesar la solicitud." };
  }
}

export async function toggleProviderStatus(id: string, currentStatus: boolean) {
  const session = await auth();
  if (session?.user?.role !== "SUPER_ADMIN") throw new Error("No autorizado");

  await db.providerCompany.update({
    where: { id },
    data: { isActive: !currentStatus }
  });

  revalidatePath("/dashboard/global/providers");
  return { success: true };
}

export async function deleteProvider(id: string) {
  const session = await auth();
  if (session?.user?.role !== "SUPER_ADMIN") throw new Error("No autorizado");

  try {
    // 1. Verificar si tiene tickets (Integridad Referencial)
    const hasTickets = await db.ticket.findFirst({
      where: { providerId: id }
    });

    if (hasTickets) {
      return { 
        error: "No se puede eliminar: Esta empresa ya tiene tickets generados. Desactívala en su lugar." 
      };
    }

    // 2. Eliminar en cascada (Usuarios y Empresa)
    // Nota: Si no tienes configurado 'onDelete: Cascade' en Prisma, 
    // primero borramos los usuarios manualmente en la transacción.
    await db.$transaction([
      db.user.deleteMany({ where: { providerId: id } }),
      db.ticketStatus.deleteMany({ where: { providerId: id } }),
      db.ticketPriority.deleteMany({ where: { providerId: id } }),
      db.ticketCategory.deleteMany({ where: { providerId: id } }),
      db.providerCompany.delete({ where: { id } })
    ]);

    revalidatePath("/dashboard/global/providers");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Error al intentar eliminar el proveedor." };
  }
}
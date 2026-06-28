// src/lib/actions/maintenance.ts
"use server";

import db from "@/lib/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function clearProviderData(targetProviderId: string) {
  // 1. Doble escudo de seguridad: Verificar sesión y rol estricto
  const session = await auth();
  if (!session?.user?.role || session.user.role !== "SUPER_ADMIN") {
    return { success: false, message: "No autorizado. Operación restringida a Súper Administradores." };
  }

  if (!targetProviderId) {
    return { success: false, message: "ID de proveedor no válido." };
  }

  try {
    // 2. Ejecución atómica en cascada controlada manual
    await db.$transaction(async (tx) => {
      
      // PASO 1: Historial de Tickets vinculados al Proveedor
      await tx.ticketHistory.deleteMany({
        where: {
          ticket: { providerId: targetProviderId }
        }
      });

      // PASO 2: Los Tickets del Proveedor
      await tx.ticket.deleteMany({
        where: { providerId: targetProviderId }
      });

      // PASO 3: Las Secuencias de los Folios de este Proveedor
      await tx.ticketSequence.deleteMany({
        where: { providerId: targetProviderId }
      });

      // PASO 4: Usuarios con rol CONTACTO_CLIENTE bajo este Proveedor
      // Primero limpiamos sus tokens de reinicio si es que registraron alguno
      const clientUsers = await tx.user.findMany({
        where: { providerId: targetProviderId, role: "CONTACTO_CLIENTE" },
        select: { email: true }
      });
      const clientEmails = clientUsers.map(u => u.email);

      await tx.passwordResetToken.deleteMany({
        where: { email: { in: clientEmails } }
      });

      // Borramos los usuarios clientes
      await tx.user.deleteMany({
        where: { providerId: targetProviderId, role: "CONTACTO_CLIENTE" }
      });

      // PASO 5: Por último, las Empresas Cliente del Proveedor
      await tx.clientCompany.deleteMany({
        where: { providerId: targetProviderId }
      });
      
    });

    // 3. Revalidar la caché global para limpiar pantallas al instante
    revalidatePath("/dashboard", "layout");

    return { 
      success: true, 
      message: "Ecosistema purgado con éxito. Clientes y tickets eliminados, configuración maestra intacta." 
    };

  } catch (error) {
    console.error("❌ PURGE_DATABASE_ERROR:", error);
    return { 
      success: false, 
      message: "Error crítico en los esquemas relacionales al intentar limpiar el proveedor." 
    };
  }
}
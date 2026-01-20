// src/lib/actions/tickets.ts
"use server";

import { auth } from "@/auth";
import db from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Priority, TicketStatus, Category } from "@prisma/client";

export async function createTicket(formData: FormData) {
  const session = await auth();
  if (!session?.user || !session.user.id) throw new Error("No autorizado");

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const priority = formData.get("priority") as Priority;
  const category = formData.get("category") as Category; // <--- Capturamos el ENUM
  const clientId = formData.get("clientId") as string;

  if (!clientId) throw new Error("Debe seleccionar una empresa cliente.");

  const providerId = session.user.providerId;
  let finalProviderId;

  if (!providerId) {
    const mainProvider = await db.providerCompany.findFirst();
    if (!mainProvider) throw new Error("No se encontró una empresa proveedora configurada.");
    finalProviderId = mainProvider.id;
  } else {
    finalProviderId = providerId;
  }

  await db.ticket.create({
    data: {
      title,
      description,
      priority,
      category, // <--- Usamos el valor dinámico del formulario
      status: TicketStatus.PENDIENTE,
      creatorId: session.user.id,
      clientId: clientId,
      providerId: finalProviderId,
    },
  });

  revalidatePath("/dashboard/tickets");
  redirect("/dashboard/tickets");
}
// src/app/dashboard/tickets/new/page.tsx
import { auth } from "@/auth";
import db from "@/lib/db";
import TicketForm from "@/components/tickets/ticket-form";
import { redirect } from "next/navigation";

export default async function NewTicketPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const isAdmin = session.user.role === "ADMIN" || session.user.role === "SOPORTE";

  // IMPORTANTE: Incluir los contactos en la consulta
  const companies = await db.clientCompany.findMany({
    where: isAdmin ? {} : { id: session.user.clientId || "" },
    include: {
      contacts: {
        where: { role: "CONTACTO_CLIENTE", isActive: true },
        orderBy: { name: 'asc' }
      }
    },
    orderBy: { name: 'asc' }
  });

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-black text-slate-900 mb-6 tracking-tight">
        Crear Nuevo Requerimiento
      </h1>
      <TicketForm 
        companies={companies} 
        isAdmin={isAdmin} 
        defaultClientId={session.user.clientId ?? undefined} 
        sessionUser={{
          id: session.user.id!,
          role: session.user.role!
        }}
      />
    </div>
  );
}
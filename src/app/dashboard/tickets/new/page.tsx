// src/app/dashboard/tickets/new/page.tsx
import { auth } from "@/auth";
import db from "@/lib/db";
import TicketForm from "@/components/tickets/ticket-form";

export default async function NewTicketPage() {
  const session = await auth();
  const isAdmin = session?.user?.role === "ADMIN";

  const companies = isAdmin 
    ? await db.clientCompany.findMany({ orderBy: { name: 'asc' } }) 
    : [];

  return (
    <div className="max-w-3xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Crear Nuevo Requerimiento</h1>
      <TicketForm 
        companies={companies} 
        isAdmin={isAdmin} 
        defaultClientId={session?.user?.clientId ?? undefined} 
      />
    </div>
  );
}
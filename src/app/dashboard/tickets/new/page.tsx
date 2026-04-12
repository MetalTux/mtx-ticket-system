// src/app/dashboard/tickets/new/page.tsx
import { auth } from "@/auth";
import db from "@/lib/db";
import TicketForm from "@/components/tickets/ticket-form";
import { redirect } from "next/navigation";
import { getTicketMasters } from "@/lib/actions/masters";

export default async function NewTicketPage() {
  const session = await auth();
  
  // 1. Seguridad y Contexto
  if (!session?.user?.id || !session.user.providerId) {
    redirect("/auth/login");
  }

  const { providerId, role, clientId: userClientId } = session.user;
  const isAdmin = role ? ["ADMIN", "SOPORTE", "DESARROLLO"].includes(role) : false;

  // 2. Carga de Datos en Paralelo
  // Traemos los maestros (Prioridades/Categorías) y las Empresas Clientes con sus contactos
  const [masters, companies] = await Promise.all([
    getTicketMasters(),
    db.clientCompany.findMany({
      where: {
        providerId: providerId,
        // Si no es admin, solo ve su propia empresa
        ...(isAdmin ? {} : { id: userClientId || "" }),
        isActive: true,
      },
      include: {
        contacts: {
          where: { role: "CONTACTO_CLIENTE", isActive: true },
          orderBy: { name: 'asc' }
        }
      },
      orderBy: { name: 'asc' }
    })
  ]);

  // Manejo de error si los maestros fallan
  if ("error" in masters) {
    return (
      <div className="p-6 bg-red-50 text-red-600 rounded-xl border border-red-200 m-4">
        Error al cargar la configuración de GTSoft. Reintenta en unos momentos.
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 transition-colors duration-300">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">
          Crear Nuevo Requerimiento
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">
          Inicia una nueva solicitud en el ecosistema de soporte.
        </p>
      </div>

      <TicketForm 
        companies={companies} 
        priorities={masters.priorities}
        categories={masters.categories}
        isAdmin={isAdmin} 
        defaultClientId={userClientId ?? undefined} 
        sessionUser={{
          id: session.user.id,
          role: role!
        }}
      />
    </div>
  );
}
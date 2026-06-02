// src/app/dashboard/tickets/new/page.tsx
import { auth } from "@/auth";
import db from "@/lib/db";
import TicketForm from "@/components/tickets/ticket-form";
import { redirect } from "next/navigation";
import { getTicketMasters } from "@/lib/actions/masters";

export default async function NewTicketPage() {
  const session = await auth();
  
  if (!session?.user?.id || !session.user.providerId) {
    redirect("/auth/login");
  }

  const { providerId, role, clientId: userClientId, id: userId } = session.user;
  const isAdmin = role === "ADMIN" || role === "SUPER_ADMIN";
  const isClient = role === "CONTACTO_CLIENTE";

  // 1. Carga de Datos en Paralelo (Añadimos la búsqueda de permisos del usuario)
  const [masters, companies, dbUser] = await Promise.all([
    getTicketMasters(),
    db.clientCompany.findMany({
      where: {
        providerId: providerId,
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
    }),
    // Buscamos las categorías permitidas si el usuario es STAFF (Ni ADMIN, Ni CLIENTE)
    (!isAdmin && !isClient) 
      ? db.user.findUnique({
          where: { id: userId },
          select: { allowedCategories: { select: { id: true } } }
        })
      : Promise.resolve(null)
  ]);

  if ("error" in masters) {
    return (
      <div className="p-6 bg-red-50 text-red-600 rounded-xl border border-red-200 m-4">
        Error al cargar la configuración de GTSoft. Reintenta en unos momentos.
      </div>
    );
  }

  // 2. Filtro RBAC para el Desplegable de Categorías
  let availableCategories = masters.categories;
  
  if (!isAdmin && !isClient && dbUser) {
    const allowedIds = dbUser.allowedCategories.map(c => c.id);
    // Filtramos la lista maestra para que solo queden las categorías permitidas
    availableCategories = availableCategories.filter(c => allowedIds.includes(c.id));
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
        categories={availableCategories} /* PASAMOS LAS CATEGORÍAS FILTRADAS */
        attentionTypes={masters.attentionTypes}
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
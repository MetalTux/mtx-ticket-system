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

  // CÁLCULO DE FECHAS PARA EL MES ACTUAL
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  // 1. Carga de Datos en Paralelo
  const [masters, rawCompanies, dbUser] = await Promise.all([
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
        },
        // TRAEMOS EL HISTORIAL DEL MES PARA CALCULAR
        tickets: {
          select: {
            history: {
              where: { createdAt: { gte: startOfMonth, lte: endOfMonth } },
              select: { timeAnalysis: true, timeDev: true, timeSupport: true, timeUpdate: true }
            }
          }
        }
      },
      orderBy: { name: 'asc' }
    }),
    // Buscamos las categorías permitidas si el usuario es STAFF
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

  // PROCESAMOS LOS MINUTOS CONSUMIDOS DE CADA EMPRESA
  const enrichedCompanies = rawCompanies.map(company => {
    let consumedMinutes = 0;
    company.tickets.forEach(ticket => {
      ticket.history.forEach(h => {
        consumedMinutes += h.timeAnalysis + h.timeDev + h.timeSupport + h.timeUpdate;
      });
    });
    
    // Devolvemos la empresa sin el arreglo de tickets (para no sobrecargar el cliente)
    const { tickets, ...rest } = company;
    return { ...rest, consumedMinutes };
  });

  // 2. Filtro RBAC para el Desplegable de Categorías
  let availableCategories = masters.categories;
  
  if (!isAdmin && !isClient && dbUser) {
    const allowedIds = dbUser.allowedCategories.map(c => c.id);
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
        companies={enrichedCompanies} 
        priorities={masters.priorities}
        categories={availableCategories}
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
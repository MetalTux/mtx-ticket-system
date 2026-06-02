// src/app/dashboard/tickets/page.tsx
import { auth } from "@/auth";
import db from "@/lib/db";
import Link from "next/link";
import { Prisma } from "@prisma/client";
import TicketFilters from "@/components/tickets/ticket-filters";
import ColumnSearch from "@/components/tickets/column-search";
import SortButton from "@/components/tickets/sort-button";
import { StatCard } from "@/components/tickets/stat-card";
import { Plus, Ticket as TicketIcon } from "lucide-react";
import { getTicketMasters } from "@/lib/actions/masters";
import { redirect } from "next/navigation";

export default async function TicketsPage({
  searchParams,
}: {
  searchParams: Promise<TicketSearchParams>;
}) {
  const session = await auth();
  if (!session?.user?.id || !session.user.providerId) redirect("/auth/login");

  const params = await searchParams;
  const providerId = session.user.providerId;
  const role = session.user.role;
  const userId = session.user.id;

  // 1. Obtener Maestros y Permisos de Usuario en paralelo
  const [masters, dbUser] = await Promise.all([
    getTicketMasters(),
    // Buscamos las categorías permitidas si el usuario es STAFF (No ADMIN, No CLIENTE)
    (role !== "ADMIN" && role !== "SUPER_ADMIN" && role !== "CONTACTO_CLIENTE") 
      ? db.user.findUnique({
          where: { id: userId },
          select: { allowedCategories: { select: { id: true } } }
        })
      : Promise.resolve(null)
  ]);

  if ("error" in masters) return <div>Error al cargar maestros.</div>;

  // 2. Construir la bóveda de seguridad RBAC
  let rbacWhere: Prisma.TicketWhereInput = {};
  
  if (role === "CONTACTO_CLIENTE") {
    // El cliente solo ve su empresa
    rbacWhere = { clientId: session.user.clientId || "" };
  } else if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
    // El STAFF ve: Sus propios tickets O los que tiene asignados O los de sus categorías permitidas
    const allowedCategoryIds = dbUser?.allowedCategories.map(c => c.id) || [];
    rbacWhere = {
      OR: [
        { creatorId: userId },      // Lo pidió él
        { createdById: userId },    // Lo registró él a nombre de otro
        { assignedToId: userId },   // Se lo asignaron a él
        { categoryId: { in: allowedCategoryIds } } // Tiene permiso sobre la categoría
      ]
    };
  }
  // Si es ADMIN, rbacWhere queda vacío ({}), por lo que verá todo el providerId.

  const sortField = params.sort || "createdAt";
  const sortOrder = (params.order as Prisma.SortOrder) || "desc";
  const page = Number(params.page) || 1;
  const pageSize = 10;

  // 3. Unir RBAC con los Filtros de URL
  const whereClause: Prisma.TicketWhereInput = {
    providerId,
    ...rbacWhere,
    ...(params.status && { statusId: params.status }),
    ...(params.category && { categoryId: params.category }),
    ...(params.title && { title: { contains: params.title, mode: 'insensitive' } }),
    ...(params.clientName && { client: { name: { contains: params.clientName, mode: 'insensitive' } } }),
  };

  // 4. Lógica de Ordenamiento
  const getOrderBy = (field: string, order: Prisma.SortOrder): Prisma.TicketOrderByWithRelationInput => {
    switch (field) {
      case "client.name": return { client: { name: order } };
      case "assignedTo.name": return { assignedTo: { name: order } };
      case "title": return { title: order };
      case "status": return { status: { name: order } };
      case "priority": return { priority: { weight: order } }; 
      case "createdAt":
      default: return { createdAt: order };
    }
  };

  const orderBy = getOrderBy(sortField, sortOrder);

  // 5. Consultas a Base de Datos
  const [tickets, totalTickets, stats] = await Promise.all([
    db.ticket.findMany({
      where: whereClause,
      include: { 
        client: true, 
        creator: true, 
        assignedTo: true,
        status: true,
        priority: true
      },
      orderBy: orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.ticket.count({ where: whereClause }),
    db.ticket.groupBy({
      by: ['statusId'],
      where: whereClause, // IMPORTANTE: Agrupar usando la misma regla de seguridad
      _count: { statusId: true }
    }),
  ]);

  const totalPages = Math.ceil(totalTickets / pageSize);

  // 6. Mapeo de Estadísticas
  const getStatCount = (key: string) => {
    const statusObj = masters.statuses.find(s => s.systemKey === key);
    if (!statusObj) return 0;
    return stats.find(s => s.statusId === statusObj.id)?._count.statusId || 0;
  };

  return (
    <div className="space-y-2 lg:!space-y-6 pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 lg:!gap-4">
        <div>
          <h1 className="text-xl lg:!text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <TicketIcon size={20} className="text-brand-600 dark:text-brand-50" />
            Panel de Tickets
          </h1>
          <p className="text-[11px] lg:!text-sm text-slate-500 dark:text-slate-400 font-medium">GTSoft Core: Gestión de requerimientos.</p>
        </div>
        <Link href="/dashboard/tickets/new" className="btn-primary w-auto py-2 px-4 text-xs lg:!text-sm flex items-center gap-2 shadow-lg">
          <Plus size={16} /> Nuevo Requerimiento
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 lg:!gap-4">
        <StatCard label="Total" value={totalTickets} color="bg-slate-500" />
        <StatCard label="Abiertos" value={getStatCount('OPEN')} color="bg-orange-500" />
        <StatCard label="En Proceso" value={getStatCount('IN_PROGRESS')} color="bg-blue-500" />
        <StatCard label="Resueltos" value={getStatCount('RESOLVED')} color="bg-emerald-500" />
      </div>

      <TicketFilters statuses={masters.statuses} categories={masters.categories} />

      <div className="card-module !p-0 overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-black tracking-widest border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-4 min-w-[220px]">
                  <div className="flex flex-col gap-1.5">
                    <SortButton label="Ticket / Título" column="title" />
                    <ColumnSearch paramName="title" placeholder="Buscar..." />
                  </div>
                </th>
                <th className="p-4 whitespace-nowrap">Estado</th>
                <th className="p-4 whitespace-nowrap hidden lg:!table-cell">Prioridad</th>
                <th className="p-4 min-w-[160px]">
                  <div className="flex flex-col gap-1.5">
                    <SortButton label="Cliente" column="client.name" />
                    <ColumnSearch paramName="clientName" placeholder="Cliente..." />
                  </div>
                </th>
                <th className="p-4 hidden lg:!table-cell">Fecha</th>
                <th className="p-4 min-w-[150px] hidden lg:!table-cell">Asignado</th>
                <th className="p-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
              {tickets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-400 italic">No hay tickets.</td>
                </tr>
              ) : (
                tickets.map((ticket) => (
                  <tr key={ticket.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-brand-600 truncate max-w-[280px]">
                        {ticket.title}
                      </div>
                      <div className="text-[9px] font-black text-slate-400 tracking-tight mt-0.5 uppercase">
                        {ticket.folio}
                      </div>
                    </td>
                    
                    <td className="p-4">
                      <span 
                        className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase border"
                        style={{ 
                          color: ticket.status.color, 
                          backgroundColor: `${ticket.status.color}15`, 
                          borderColor: `${ticket.status.color}30` 
                        }}
                      >
                        {ticket.status.name}
                      </span>
                    </td>

                    <td className="p-4 hidden lg:!table-cell">
                      <span className="font-bold text-slate-700 dark:text-slate-300 text-[11px] flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: ticket.priority.color }} />
                        {ticket.priority.name}
                      </span>
                    </td>

                    <td className="p-4 text-slate-600 dark:text-slate-400 font-medium">{ticket.client.name}</td>

                    <td className="p-4 text-slate-500 text-[11px] hidden lg:!table-cell whitespace-nowrap">
                      {new Date(ticket.createdAt).toLocaleDateString('es-ES')}
                    </td>

                    <td className="p-4 hidden lg:!table-cell">
                      {ticket.assignedTo ? (
                        <div className="flex items-center gap-1.5">
                          <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-[9px] font-black uppercase">
                            {ticket.assignedTo.name?.charAt(0)}
                          </div>
                          <span className="text-[11px] font-bold truncate max-w-[100px]">{ticket.assignedTo.name}</span>
                        </div>
                      ) : <span className="text-[10px] text-slate-400 italic">Sin asignar</span>}
                    </td>

                    <td className="p-4 text-right">
                      <Link href={`/dashboard/tickets/${ticket.id}`} className="px-3 py-1.5 bg-white dark:bg-slate-800 border rounded-lg text-[10px] font-black hover:border-brand-500 transition-all">
                        Ver
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

type TicketSearchParams = {
  page?: string;
  status?: string;
  category?: string;
  title?: string;
  clientName?: string;
  sort?: string;
  order?: "asc" | "desc";
};
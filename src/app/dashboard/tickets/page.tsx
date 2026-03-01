// src/app/dashboard/tickets/page.tsx
import { auth } from "@/auth";
import db from "@/lib/db";
import Link from "next/link";
import { STATUS_LABELS, PRIORITY_LABELS } from "@/enums/constantes";
import { Prisma, TicketStatus, Category } from "@prisma/client";
import TicketFilters from "@/components/tickets/ticket-filters";
import ColumnSearch from "@/components/tickets/column-search";
import SortButton from "@/components/tickets/sort-button";
import { StatCard } from "@/components/tickets/stat-card";
import { Plus, Ticket as TicketIcon } from "lucide-react";

export default async function TicketsPage({
  searchParams,
}: {
  searchParams: Promise<TicketSearchParams>;
}) {
  const session = await auth();
  const params = await searchParams;

  const sortField = params.sort || "createdAt";
  const sortOrder = (params.order as Prisma.SortOrder) || "desc";
  const page = Number(params.page) || 1;
  const pageSize = 10;

  const statusFilter = params.status;
  const categoryFilter = params.category;
  const titleSearch = params.title;
  const clientSearch = params.clientName;

  const whereClause: Prisma.TicketWhereInput = {
    ...(session?.user?.role === "CONTACTO_CLIENTE" ? { clientId: session.user.clientId as string } : { providerId: session!.user.providerId! }),
    ...(statusFilter && { status: statusFilter as TicketStatus }),
    ...(categoryFilter && { category: categoryFilter as Category }),
    ...(titleSearch && { title: { contains: titleSearch, mode: 'insensitive' } }),
    ...(clientSearch && { client: { name: { contains: clientSearch, mode: 'insensitive' } } }),
  };

  let orderBy: Prisma.TicketOrderByWithRelationInput = {};
  if (sortField.includes(".")) {
    const [relation, field] = sortField.split(".");
    orderBy = { [relation]: { [field]: sortOrder } } as Prisma.TicketOrderByWithRelationInput;
  } else {
    orderBy = { [sortField]: sortOrder };
  }

  const [tickets, totalTickets, stats] = await Promise.all([
    db.ticket.findMany({
      where: whereClause,
      include: { client: true, creator: true, assignedTo: true },
      orderBy: orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.ticket.count({ where: whereClause }),
    db.ticket.groupBy({
      by: ['status'],
      where: {
        ...(session?.user?.role === "CONTACTO_CLIENTE" ? { clientId: session.user.clientId as string } : { providerId: session!.user.providerId! }),
      },
      _count: { status: true }
    }),
  ]);

  const totalPages = Math.ceil(totalTickets / pageSize);
  const statsMap = stats.reduce((acc, curr) => {
    acc[curr.status] = curr._count.status;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-2 lg:!space-y-6 pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 lg:!gap-4">
        <div>
          <h1 className="text-1xl lg:!text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <TicketIcon size={20} className="text-brand-600 dark:text-brand-500 w-5 h-5" />
            Panel de Tickets
          </h1>
          <p className="text-[11px] lg:!text-sm text-slate-500 dark:text-slate-400 font-medium">Gestión y seguimiento de requerimientos técnicos.</p>
        </div>
        <Link href="/dashboard/tickets/new" className="btn-primary w-auto lg:!w-full py-2 text-xs lg:!text-sm flex items-center gap-2 shadow-lg shadow-brand-500/20">
          <Plus size={16} /> Nuevo Requerimiento
        </Link>
      </div>

      {/* BARRA DE ESTADÍSTICAS */}
      <div className="grid grid-cols-4 lg:grid-cols-4 gap-1 lg:!gap-4">
        <StatCard label="Total" value={totalTickets} color="bg-slate-500" />
        <StatCard label="Pendientes" value={statsMap.PENDIENTE || 0} color="bg-orange-500" />
        <StatCard label="En Proceso" value={statsMap.EN_PROCESO || 0} color="bg-blue-500" />
        <StatCard label="Resueltos" value={statsMap.RESUELTO || 0} color="bg-emerald-500" />
      </div>

      <TicketFilters />

      <div className="card-module !p-0 lg:!p-2 overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-black tracking-widest border-b border-slate-200 dark:border-slate-800">
              <tr>
                {/* Reducimos padding de th de 4 a 2.5 en móvil y 4 en LG */}
                <th className="p-1.5 lg:p-4 min-w-[220px]">
                  <div className="flex flex-col gap-1.5">
                    <SortButton label="Ticket / Título" column="title" />
                    <ColumnSearch paramName="title" placeholder="Buscar..." />
                  </div>
                </th>
                <th className="p-1.5 lg:p-4 whitespace-nowrap">Estado</th>
                <th className="p-1.5 lg:p-4 whitespace-nowrap hidden lg:!table-cell">Prioridad</th>
                <th className="p-1.5 lg:p-4 min-w-[160px]">
                  <div className="flex flex-col gap-1.5">
                    <SortButton label="Cliente" column="client.name" />
                    <ColumnSearch paramName="clientName" placeholder="Cliente..." />
                  </div>
                </th>
                <th className="p-1.5 lg:p-4 hidden lg:!table-cell">
                  <SortButton label="Fecha" column="createdAt" />
                </th>
                <th className="p-1.5 lg:p-4 min-w-[150px] hidden lg:!table-cell">
                  <div className="flex flex-col gap-1.5">
                    <SortButton label="Asignado" column="assignedTo.name" />
                    <ColumnSearch paramName="assignedName" placeholder="Técnico..." />
                  </div>
                </th>
                <th className="p-1.5 lg:p-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
              {tickets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-400 dark:text-slate-500 italic bg-slate-50/50 dark:bg-slate-900/50">
                    No se encontraron tickets.
                  </td>
                </tr>
              ) : (
                tickets.map((ticket) => (
                  <tr key={ticket.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    {/* Celda Principal: Compactamos Título y Folio */}
                    <td className="p-1.5 lg:p-4">
                      <div className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors truncate max-w-[200px] lg:max-w-[280px] leading-tight">
                        {ticket.title}
                      </div>
                      <div className="text-[9px] font-black text-slate-400 dark:text-slate-500 tracking-tight mt-0.5">
                        #{ticket.folio || ticket.id.slice(-6).toUpperCase()}
                      </div>
                    </td>
                    
                    <td className="p-1.5 lg:p-4">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border transition-colors whitespace-nowrap ${
                        ticket.status === 'PENDIENTE' 
                          ? 'border-orange-200 bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:border-orange-500/30 dark:text-orange-400' 
                          : 'border-slate-200 bg-slate-50 text-slate-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400'
                      }`}>
                        {STATUS_LABELS[ticket.status]}
                      </span>
                    </td>

                    <td className="p-1.5 lg:p-4 hidden lg:!table-cell">
                      <span className="font-bold text-slate-700 dark:text-slate-300 text-[11px]">
                        {PRIORITY_LABELS[ticket.priority]}
                      </span>
                    </td>

                    <td className="p-1.5 lg:p-4 text-slate-600 dark:text-slate-400 font-medium text-xs lg:!text-sm">
                      <div className="truncate max-w-[120px] lg:max-w-none">
                        {ticket.client.name}
                      </div>
                    </td>

                    <td className="p-1.5 lg:p-4 text-slate-500 dark:text-slate-500 text-[11px] hidden lg:!table-cell whitespace-nowrap">
                      {new Date(ticket.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </td>

                    <td className="p-1.5 lg:p-4 hidden lg:!table-cell">
                      {ticket.assignedToId ? (
                        <div className="flex items-center gap-1.5">
                          <div className="w-6 h-6 rounded-full bg-brand-600 text-white flex items-center justify-center text-[9px] font-black shadow-sm flex-shrink-0">
                            {ticket.assignedTo?.name?.charAt(0)}
                          </div>
                          <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 truncate max-w-[80px]">
                            {ticket.assignedTo?.name}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">Libre</span>
                      )}
                    </td>

                    <td className="p-1.5 lg:p-4 text-right">
                      <Link 
                        href={`/dashboard/tickets/${ticket.id}`} 
                        className="inline-flex items-center justify-center px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-[10px] font-black text-slate-700 dark:text-slate-200 hover:text-brand-600 transition-all shadow-sm"
                      >
                        Ver
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINACIÓN COMPACTA */}
        <div className="p-1.5 lg:p-4 border-t border-slate-100 dark:border-slate-800 flex flex-row justify-between lg:!items-center bg-slate-50/50 dark:bg-slate-900/50">
          <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest hidden lg:!inline">
            {totalTickets} Total
          </span>
          <div className="flex items-center gap-1.5 w-full lg:!w-auto justify-between lg:!justify-end">
            <Link
              href={buildPageUrl(params, page - 1)}
              className={`px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[10px] font-bold transition-all ${page <= 1 ? "pointer-events-none opacity-40" : "hover:bg-slate-50"}`}
            >
              Anterior
            </Link>
            <div className="px-3 py-1.5 bg-brand-600 text-white rounded-lg text-[10px] font-black">
              {page}/{totalPages || 1}
            </div>
            <Link
              href={buildPageUrl(params, page + 1)}
              className={`px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[10px] font-bold transition-all ${page >= totalPages ? "pointer-events-none opacity-40" : "hover:bg-slate-50"}`}
            >
              Siguiente
            </Link>
          </div>
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

function buildPageUrl(params: TicketSearchParams, newPage: number) {
  const urlParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) urlParams.set(key, value);
  });
  urlParams.set("page", newPage.toString());
  return `?${urlParams.toString()}`;
}
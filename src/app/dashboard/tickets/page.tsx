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
    <div className="space-y-6 pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <TicketIcon className="text-brand-600 dark:text-brand-500" />
            Panel de Tickets
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Gestión y seguimiento de requerimientos técnicos.</p>
        </div>
        <Link href="/dashboard/tickets/new" className="btn-primary flex items-center gap-2 shadow-lg shadow-brand-500/20">
          <Plus size={18} /> Nuevo Requerimiento
        </Link>
      </div>

      {/* BARRA DE ESTADÍSTICAS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Tickets" value={totalTickets} color="bg-slate-500" />
        <StatCard label="Pendientes" value={statsMap.PENDIENTE || 0} color="bg-orange-500" />
        <StatCard label="En Proceso" value={statsMap.EN_PROCESO || 0} color="bg-blue-500" />
        <StatCard label="Resueltos" value={statsMap.RESUELTO || 0} color="bg-emerald-500" />
      </div>

      <TicketFilters />

      <div className="card-module overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-black tracking-widest border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-4 min-w-[250px]">
                  <div className="flex flex-col gap-2">
                    <SortButton label="Ticket / Título" column="title" />
                    <ColumnSearch paramName="title" placeholder="Buscar por título..." />
                  </div>
                </th>
                <th className="p-4 whitespace-nowrap">Estado</th>
                <th className="p-4 whitespace-nowrap">Prioridad</th>
                <th className="p-4 min-w-[180px]">
                  <div className="flex flex-col gap-2">
                    <SortButton label="Empresa Cliente" column="client.name" />
                    <ColumnSearch paramName="clientName" placeholder="Buscar empresa..." />
                  </div>
                </th>
                <th className="p-4">
                   <SortButton label="Fecha" column="createdAt" />
                </th>
                <th className="p-4 min-w-[180px]">
                  <div className="flex flex-col gap-2">
                    <SortButton label="Asignado" column="assignedTo.name" />
                    <ColumnSearch paramName="assignedName" placeholder="Buscar técnico..." />
                  </div>
                </th>
                <th className="p-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
              {tickets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-20 text-center text-slate-400 dark:text-slate-500 italic bg-slate-50/50 dark:bg-slate-900/50">
                    No se encontraron tickets registrados.
                  </td>
                </tr>
              ) : (
                tickets.map((ticket) => (
                  <tr key={ticket.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors truncate max-w-[280px]">
                        {ticket.title}
                      </div>
                      <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 tracking-tight">#{ticket.folio || ticket.id.slice(-6).toUpperCase()}</div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border transition-colors ${
                        ticket.status === 'PENDIENTE' 
                          ? 'border-orange-200 bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:border-orange-500/30 dark:text-orange-400' 
                          : 'border-slate-200 bg-slate-50 text-slate-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400'
                      }`}>
                        {STATUS_LABELS[ticket.status]}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-slate-700 dark:text-slate-300 text-xs">
                        {PRIORITY_LABELS[ticket.priority]}
                      </span>
                    </td>
                    <td className="p-4 text-slate-600 dark:text-slate-400 font-medium">
                      {ticket.client.name}
                    </td>
                    <td className="p-4 text-slate-500 dark:text-slate-500 text-xs">
                      {new Date(ticket.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </td>
                    <td className="p-4">
                      {ticket.assignedToId ? (
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-brand-600 text-white flex items-center justify-center text-[10px] font-black shadow-sm">
                            {ticket.assignedTo?.name?.charAt(0)}
                          </div>
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{ticket.assignedTo?.name}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 dark:text-slate-600 italic">Sin asignar</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <Link 
                        href={`/dashboard/tickets/${ticket.id}`} 
                        className="inline-flex items-center justify-center px-4 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-black text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-brand-600 transition-all shadow-sm"
                      >
                        Ver Ficha
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* CONTROLES DE PAGINACIÓN */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/50 dark:bg-slate-900/50">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-black uppercase tracking-widest">
            {totalTickets} Tickets en total
          </span>
          <div className="flex items-center gap-2">
            <Link
              href={buildPageUrl(params, page - 1)}
              className={`px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 transition-all ${page <= 1 ? "pointer-events-none opacity-40" : "hover:bg-slate-50 dark:hover:bg-slate-700"}`}
            >
              Anterior
            </Link>
            <div className="px-4 py-2 bg-brand-600 text-white rounded-lg text-xs font-black shadow-md shadow-brand-500/20">
              {page} / {totalPages || 1}
            </div>
            <Link
              href={buildPageUrl(params, page + 1)}
              className={`px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 transition-all ${page >= totalPages ? "pointer-events-none opacity-40" : "hover:bg-slate-50 dark:hover:bg-slate-700"}`}
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


// // src/app/dashboard/tickets/page.tsx
// import { auth } from "@/auth";
// import db from "@/lib/db";
// import Link from "next/link";
// import { STATUS_LABELS, PRIORITY_LABELS } from "@/enums/constantes";
// import { Prisma, TicketStatus, Category } from "@prisma/client";
// import TicketFilters from "@/components/tickets/ticket-filters";
// import ColumnSearch from "@/components/tickets/column-search";
// import SortButton from "@/components/tickets/sort-button";
// import { StatCard } from "@/components/tickets/stat-card";

// export default async function TicketsPage({
//   searchParams,
// }: {
//   searchParams: Promise<TicketSearchParams>;
// }) {
//   const session = await auth();
//   const params = await searchParams; // En Next.js 15 searchParams es una Promise

//   // 2. Valores por defecto para el ordenamiento
//   const sortField = params.sort || "createdAt";
//   const sortOrder = (params.order as Prisma.SortOrder) || "desc";
  
//   const page = Number(params.page) || 1;
//   const pageSize = 10;

//   // --- Captura de Filtros ---
//   const statusFilter = params.status;
//   const categoryFilter = params.category;
//   const titleSearch = params.title;
//   const clientSearch = params.clientName;

//   // --- Construcción del whereClause dinámico ---
//   const whereClause: Prisma.TicketWhereInput = {
//     // Seguridad: Si no es ADMIN, solo ve sus tickets
//     ...(session?.user?.role === "CONTACTO_CLIENTE" ? { clientId: session.user.clientId as string } : {}),
    
//     // Filtros Globales (Dropdowns)
//     ...(statusFilter && { status: statusFilter as TicketStatus }),
//     ...(categoryFilter && { category: categoryFilter as Category }),
    
//     // Filtros por Columna (Búsqueda de texto)
//     ...(titleSearch && { title: { contains: titleSearch, mode: 'insensitive' } }),
//     ...(clientSearch && { client: { name: { contains: clientSearch, mode: 'insensitive' } } }),
//   };

//   // FILTRO DE SEGURIDAD OBLIGATORIO
//   if (session?.user?.role === "CONTACTO_CLIENTE") {
//     whereClause.clientId = session.user.clientId!; 
//   } else {
//     // Si es staff/admin, solo ve los de su propia proveedora (si manejas varios proveedores)
//     whereClause.providerId = session!.user.providerId!;
//   }

//   // --- LÓGICA DE TRANSFORMACIÓN PARA ORDENAMIENTO ---
//   let orderBy: Prisma.TicketOrderByWithRelationInput = {};

//   if (sortField.includes(".")) {
//     const [relation, field] = sortField.split(".");
    
//     // Usamos un Type Cast controlado para que Prisma acepte la relación dinámica
//     orderBy = {
//       [relation]: {
//         [field]: sortOrder
//       }
//     } as Prisma.TicketOrderByWithRelationInput;
//   } else {
//     orderBy = {
//       [sortField]: sortOrder
//     };
//   }

//   const [tickets, totalTickets, stats] = await Promise.all([
//     db.ticket.findMany({
//       where: whereClause,
//       include: { client: true, creator: true, assignedTo: true },
//       orderBy: orderBy, // <-- Dinámico
//       skip: (page - 1) * pageSize,
//       take: pageSize,
//     }),
//     db.ticket.count({ where: whereClause }),
//     db.ticket.groupBy({
//       by: ['status'],
//       where: {
//         ...(session?.user?.role === "CONTACTO_CLIENTE" ? { clientId: session.user.clientId as string } : {}),
//       },
//       _count: {
//         status: true
//       }
//     }),
//   ]);

//   const totalPages = Math.ceil(totalTickets / pageSize);
//   // Transformamos el array de Prisma en un objeto fácil de usar
//   const statsMap = stats.reduce((acc, curr) => {
//     acc[curr.status] = curr._count.status;
//     return acc;
//   }, {} as Record<string, number>);

//   return (
//     <div className="space-y-6">
//       <div className="flex justify-between items-center">
//         <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Panel de Tickets</h1>
//         <Link href="/dashboard/tickets/new" className="btn-primary">
//           + Nuevo Requerimiento
//         </Link>
//       </div>

//       {/* BARRA DE ESTADÍSTICAS */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
//         <StatCard 
//           label="Total Tickets" 
//           value={totalTickets} 
//           color="bg-slate-500" 
//         />
//         <StatCard 
//           label="Pendientes" 
//           value={statsMap.PENDIENTE || 0} 
//           color="bg-orange-500" 
//         />
//         <StatCard 
//           label="En Proceso" 
//           value={statsMap.EN_PROCESO || 0} 
//           color="bg-blue-500" 
//         />
//         <StatCard 
//           label="Resueltos" 
//           value={statsMap.RESUELTO || 0} 
//           color="bg-emerald-500" 
//         />
//       </div>

//       {/* --- Filtros Globales Superiores --- */}
//       <TicketFilters />

//       <div className="card-module overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm">
//         <div className="overflow-x-auto">
//           <table className="w-full text-left border-collapse">
//             <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 uppercase text-[10px] font-bold tracking-widest">
//               <tr>
//                 <th className="p-4 border-b dark:border-slate-800 min-w-[200px]">
//                   <div className="flex flex-col gap-2">
//                     <SortButton label="Ticket/Título" column="title" />
//                     <ColumnSearch paramName="title" placeholder="Filtrar título..." />
//                   </div>
//                 </th>
//                 <th className="p-4 border-b dark:border-slate-800">Estado</th>
//                 <th className="p-4 border-b dark:border-slate-800">Prioridad</th>
//                 <th className="p-4 border-b dark:border-slate-800 min-w-[150px]">
//                   <div className="flex flex-col gap-2">
//                     <SortButton label="Cliente" column="client.name" />
//                     <ColumnSearch paramName="clientName" placeholder="Filtrar empresa..." />
//                   </div>
//                 </th>
//                 <th className="p-4 border-b dark:border-slate-800">
//                   <div className="flex flex-col gap-2">
//                     <SortButton label="Fecha" column="createdAt" />
//                   </div>
//                 </th>
//                 <th className="p-4 border-b dark:border-slate-800">
//                   <div className="flex flex-col gap-2">
//                     <SortButton label="Asignado" column="assignedTo.name" />
//                     <ColumnSearch paramName="assignedName" placeholder="Filtrar técnico..." />
//                   </div>
//                 </th>
//                 <th className="p-4 border-b dark:border-slate-800 text-right">Acción</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y dark:divide-slate-800 text-sm">
//               {tickets.length === 0 ? (
//                 <tr>
//                   <td colSpan={6} className="p-10 text-center text-slate-400 italic">
//                     No se encontraron tickets con los criterios seleccionados.
//                   </td>
//                 </tr>
//               ) : (
//                 tickets.map((ticket) => (
//                   <tr key={ticket.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
//                     <td className="p-4">
//                       <div className="font-bold text-slate-900 dark:text-white truncate max-w-[220px]">
//                         {ticket.title}
//                       </div>
//                       <div className="text-[10px] text-slate-400">{ticket.folio}</div>
//                     </td>
//                     <td className="p-4">
//                       <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase border ${
//                         ticket.status === 'PENDIENTE' ? 'border-orange-500 text-orange-600' : 'border-slate-400 text-slate-500'
//                       }`}>
//                         {STATUS_LABELS[ticket.status]}
//                       </span>
//                     </td>
//                     <td className="p-4">
//                       <span className="font-medium text-slate-600 dark:text-slate-300">
//                         {PRIORITY_LABELS[ticket.priority]}
//                       </span>
//                     </td>
//                     <td className="p-4 text-slate-500">
//                       {ticket.client.name}
//                     </td>
//                     <td className="p-4 text-slate-400 text-xs">
//                       {new Date(ticket.createdAt).toLocaleDateString()}
//                     </td>
//                     <td className="p-4">
//                       {ticket.assignedToId ? (
//                         <div className="flex items-center gap-2">
//                           <div className="w-6 h-6 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-[10px] font-bold">
//                             {ticket.assignedTo?.name?.charAt(0)}
//                           </div>
//                           <span className="text-xs font-medium">{ticket.assignedTo?.name}</span>
//                         </div>
//                       ) : (
//                         <span className="text-xs text-slate-400 italic">Sin asignar</span>
//                       )}
//                     </td>
//                     <td className="p-4 text-right">
//                       <Link 
//                         href={`/dashboard/tickets/${ticket.id}`} 
//                         className="btn-secondary py-1 px-3 text-xs font-bold"
//                       >
//                         Ver
//                       </Link>
//                     </td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>

//         {/* CONTROLES DE PAGINACIÓN */}
//         <div className="p-4 border-t dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/30 dark:bg-slate-900/10">
//           <span className="text-xs text-slate-500 font-medium">
//             Mostrando {tickets.length} de {totalTickets} tickets
//           </span>
//           <div className="flex items-center gap-2">
//             <Link
//               href={buildPageUrl(params, page - 1)}
//               className={`btn-secondary text-xs py-1.5 px-3 ${page <= 1 ? "pointer-events-none opacity-50" : ""}`}
//             >
//               Anterior
//             </Link>
//             <div className="bg-white dark:bg-slate-800 border dark:border-slate-700 px-3 py-1.5 rounded text-xs font-bold shadow-sm">
//               {page} / {totalPages || 1}
//             </div>
//             <Link
//               href={buildPageUrl(params, page + 1)}
//               className={`btn-secondary text-xs py-1.5 px-3 ${page >= totalPages ? "pointer-events-none opacity-50" : ""}`}
//             >
//               Siguiente
//             </Link>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// // 1. Definimos el tipo de los parámetros de búsqueda para toda la página
// type TicketSearchParams = {
//   page?: string;
//   status?: string;
//   category?: string;
//   title?: string;
//   clientName?: string;
//   sort?: string;  // <-- Nuevo
//   order?: "asc" | "desc"; // <-- Nuevo
// };

// /**
//  * Función auxiliar tipada para construir URLs de paginación
//  */
// function buildPageUrl(params: TicketSearchParams, newPage: number) {
//   const urlParams = new URLSearchParams();

//   // Iteramos sobre las entradas del objeto de forma segura
//   Object.entries(params).forEach(([key, value]) => {
//     if (value) {
//       urlParams.set(key, value);
//     }
//   });

//   // Actualizamos la página
//   urlParams.set("page", newPage.toString());
  
//   return `?${urlParams.toString()}`;
// }
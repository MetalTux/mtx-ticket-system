// src/app/dashboard/page.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import db from "@/lib/db";
import KanbanBoard from "@/components/dashboard/kanban-board";
import StatsCards from "@/components/dashboard/stats-cards";
import TicketsTrendChart from "@/components/dashboard/tickets-trend-chart";
import CategoryDistributionChart from "@/components/dashboard/category-distribution-chart";
import Link from "next/link";
import { ArrowRight, LayoutDashboard, History } from "lucide-react";
import { Prisma } from "@prisma/client";
import { getTicketMasters } from "@/lib/actions/masters";

export default async function DashboardPage() {
  const session = await auth();

  if (session?.user?.role === "SUPER_ADMIN") {
    redirect("/dashboard/global/providers");
  }

  const role = session?.user?.role;
  const userId = session?.user?.id;
  const providerId = session?.user?.providerId;
  const isClient = role === "CONTACTO_CLIENTE";

  if (!providerId) return <div>Error: No se encontró identificador de proveedor.</div>;

  // 1. Obtener Maestros para lógica de negocio
  const masters = await getTicketMasters();
  if ("error" in masters) return <div>Error cargando configuración.</div>;

  // 2. Filtro base de seguridad
  const ticketsWhereClause: Prisma.TicketWhereInput = isClient 
    ? { creatorId: userId, providerId: providerId } 
    : { providerId: providerId };

  // 3. Consultas en paralelo
  const [ticketsRaw, categoriesCount, recentActivity, statsDataRaw] = await Promise.all([
    db.ticket.findMany({
      where: ticketsWhereClause,
      include: {
        status: true,
        priority: true,
        category: true,
        client: { select: { name: true } }
      },
      orderBy: { updatedAt: 'desc' }
    }),
    
    db.ticket.groupBy({
      by: ['categoryId'],
      where: ticketsWhereClause,
      _count: { _all: true },
    }),

    db.ticket.findMany({
      where: {
        ...ticketsWhereClause,
        createdAt: { gte: new Date(new Date().setDate(new Date().getDate() - 7)) }
      },
      include: { status: true }
    }),

    // Conteo agrupado por statusId para las StatsCards
    db.ticket.groupBy({
      by: ['statusId'],
      where: ticketsWhereClause,
      _count: { _all: true }
    })
  ]);

  // --- LÓGICA DE ESTADÍSTICAS POR SYSTEM KEY ---
  const getCountBySystemKey = (key: string) => {
    const status = masters.statuses.find(s => s.systemKey === key);
    if (!status) return 0;
    return statsDataRaw.find(s => s.statusId === status.id)?._count._all || 0;
  };

  const stats = {
    total: ticketsRaw.length,
    pending: getCountBySystemKey('OPEN'),
    urgent: ticketsRaw.filter(t => t.priority.systemKey === 'URGENT' || t.priority.name === 'Urgente').length,
    resolvedToday: ticketsRaw.filter(t => 
      t.status.systemKey === 'RESOLVED' && 
      t.updatedAt.toDateString() === new Date().toDateString()
    ).length
  };

  // --- TRANSFORMACIÓN PARA COMPONENTES ---
  const ticketsForKanban = ticketsRaw.map(t => ({
    id: t.id,
    folio: t.folio || "",
    title: t.title,
    statusId: t.statusId,
    statusName: t.status.name,
    priority: t.priority.name,
    priorityColor: t.priority.color,
    category: t.category.name,
    client: { name: t.client.name }
  }));

  // Datos para Gráfica de Tendencia
  const trendData = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toLocaleDateString('es-CL', { day: '2-digit', month: 'short' });
    
    return {
      date: dateStr,
      abiertos: recentActivity.filter(t => 
        new Date(t.createdAt).toDateString() === d.toDateString()
      ).length,
      resueltos: recentActivity.filter(t => 
        new Date(t.createdAt).toDateString() === d.toDateString() && t.status.systemKey === "RESOLVED"
      ).length,
    };
  });

  // Datos para Gráfica de Categorías
  const categoryData = categoriesCount.map(c => {
    const cat = masters.categories.find(m => m.id === c.categoryId);
    return {
      name: cat?.name || "Otras",
      value: stats.total > 0 ? Math.round((c._count._all / stats.total) * 100) : 0,
      color: "#0ea5e9"
    }
  });

  const supportUsers = await db.user.findMany({
    where: {
      role: { in: ["ADMIN", "SOPORTE", "DESARROLLO"] },
      isActive: true,
      providerId: providerId
    },
    select: { id: true, name: true },
    orderBy: { name: 'asc' }
  });

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter flex items-center gap-3">
          <LayoutDashboard className="text-brand-600 dark:text-brand-500" size={32} />
          {isClient ? "Mis Solicitudes" : "Panel de Operaciones"}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium">
          {isClient 
            ? "Gestiona tus requerimientos y revisa el estado de tus tickets en tiempo real." 
            : `Hola, ${session?.user?.name?.split(' ')[0]}. Tienes ${stats.pending} tickets esperando atención.`}
        </p>
      </div>

      <StatsCards stats={stats} />

      {!isClient && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <TicketsTrendChart data={trendData} />
            </div>
            <div>
              <CategoryDistributionChart data={categoryData} />
            </div>
          </div>

          <div className="pt-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-6 w-1 bg-brand-600 dark:bg-brand-500 rounded-full" />
              <h2 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">
                Flujo de Trabajo (Kanban)
              </h2>
            </div>
            <KanbanBoard 
              initialTickets={ticketsForKanban} 
              supportUsers={supportUsers} 
              statuses={masters.statuses} // <-- IMPORTANTE: Ahora pasamos los estados
            />
          </div>
        </div>
      )}

      {isClient && (
        <div className="pt-4">
          <div className="flex justify-between items-end mb-6">
            <div className="flex items-center gap-3">
              <History className="text-brand-600 dark:text-brand-500" size={20} />
              <h2 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">
                Actividad Reciente
              </h2>
            </div>
            <Link 
              href="/dashboard/tickets" 
              className="text-xs font-bold text-brand-600 dark:text-brand-500 flex items-center gap-1 hover:gap-2 transition-all group"
            >
              Ver historial completo <ArrowRight size={14} />
            </Link>
          </div>
          
          <div className="grid gap-3">
            {ticketsForKanban.slice(0, 5).map(ticket => (
              <Link 
                key={ticket.id} 
                href={`/dashboard/tickets/${ticket.id}`}
                className="group flex justify-between items-center p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-brand-500 transition-all shadow-sm"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-brand-600 dark:text-brand-500 px-2 py-0.5 bg-brand-50 dark:bg-brand-500/10 rounded">
                      {ticket.folio}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      Activo
                    </span>
                  </div>
                  <p className="font-bold text-slate-800 dark:text-slate-100 group-hover:text-brand-600 transition-colors">
                    {ticket.title}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter border bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                    {ticket.statusName}
                  </span>
                  <div className="p-2 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-300 group-hover:text-brand-500">
                    <ArrowRight size={18} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}



// // src/app/dashboard/page.tsx
// import { auth } from "@/auth";
// import db from "@/lib/db";
// import KanbanBoard from "@/components/dashboard/kanban-board";
// import StatsCards from "@/components/dashboard/stats-cards";
// import TicketsTrendChart from "@/components/dashboard/tickets-trend-chart";
// import CategoryDistributionChart from "@/components/dashboard/category-distribution-chart";
// import Link from "next/link";
// import { ArrowRight, LayoutDashboard, History } from "lucide-react";
// import { Prisma } from "@prisma/client";

// export default async function DashboardPage() {
//   const session = await auth();
//   const role = session?.user?.role;
//   const userId = session?.user?.id;
//   const providerId = session?.user?.providerId;
//   const isClient = role === "CONTACTO_CLIENTE";

//   if (!providerId) return <div>Error: No se encontró identificador de proveedor.</div>;

//   // 1. Filtro base tipado correctamente para evitar errores de Prisma
//   const ticketsWhereClause: Prisma.TicketWhereInput = isClient 
//     ? { creatorId: userId, providerId: providerId } 
//     : { providerId: providerId };

//   // 2. Consultas en paralelo
//   const [ticketsRaw, statsData, categoriesCount, recentActivity] = await Promise.all([
//     db.ticket.findMany({
//       where: ticketsWhereClause,
//       include: {
//         status: true,
//         priority: true,
//         category: true,
//         client: { select: { name: true } }
//       },
//       orderBy: { updatedAt: 'desc' }
//     }),
    
//     Promise.all([
//       db.ticket.count({ where: ticketsWhereClause }),
//       db.ticket.count({ where: { ...ticketsWhereClause, status: { name: "Pendiente" } } }),
//       db.ticket.count({ where: { ...ticketsWhereClause, priority: { name: "Urgente" } } }),
//       db.ticket.count({ 
//         where: { 
//           ...ticketsWhereClause, 
//           status: { name: "Resuelto" },
//           updatedAt: { gte: new Date(new Date().setHours(0,0,0,0)) }
//         } 
//       }),
//     ]),

//     db.ticket.groupBy({
//       by: ['categoryId'],
//       where: ticketsWhereClause,
//       _count: { _all: true },
//     }),

//     db.ticket.findMany({
//       where: {
//         ...ticketsWhereClause,
//         createdAt: { gte: new Date(new Date().setDate(new Date().getDate() - 7)) }
//       },
//       include: { status: true }
//     })
//   ]);

//   // Recuperamos maestros para mapear nombres en gráficas
//   const categoryMasters = await db.ticketCategory.findMany({
//     where: { providerId: providerId }
//   });

//   // --- TRANSFORMACIÓN DE DATOS PARA COMPONENTES ---
//   // Aplanamos los objetos para que KanbanBoard y otros componentes sigan funcionando 
//   // sin tener que cambiarlos todos hoy mismo.
//   const tickets = ticketsRaw.map(t => ({
//     ...t,
//     status: t.status.name,     // Convertimos objeto a string para el componente
//     priority: t.priority.name, // Convertimos objeto a string para el componente
//     category: t.category.name, // Convertimos objeto a string para el componente
//     statusColor: t.status.color,
//     priorityColor: t.priority.color
//   }));

//   const stats = {
//     total: statsData[0],
//     pending: statsData[1],
//     urgent: statsData[2],
//     resolvedToday: statsData[3]
//   };

//   const trendData = Array.from({ length: 7 }).map((_, i) => {
//     const d = new Date();
//     d.setDate(d.getDate() - (6 - i));
//     const dateStr = d.toLocaleDateString('es-CL', { day: '2-digit', month: 'short' });
    
//     return {
//       date: dateStr,
//       abiertos: recentActivity.filter(t => 
//         new Date(t.createdAt).toDateString() === d.toDateString()
//       ).length,
//       resueltos: recentActivity.filter(t => 
//         new Date(t.createdAt).toDateString() === d.toDateString() && t.status.name === "Resuelto"
//       ).length,
//     };
//   });

//   const totalTickets = stats.total;
//   const categoryData = categoriesCount.map(c => {
//     const categoryInfo = categoryMasters.find(cm => cm.id === c.categoryId);
//     return {
//       name: categoryInfo?.name || "Otras",
//       value: totalTickets > 0 ? Math.round((c._count._all / totalTickets) * 100) : 0,
//       color: "#0ea5e9"
//     }
//   });

//   const supportUsers = await db.user.findMany({
//     where: {
//       role: { in: ["ADMIN", "SOPORTE", "DESARROLLO"] },
//       isActive: true,
//       providerId: providerId
//     },
//     select: { id: true, name: true },
//     orderBy: { name: 'asc' }
//   });

//   return (
//     <div className="space-y-8 pb-10">
//       <div className="flex flex-col gap-1">
//         <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter flex items-center gap-3">
//           <LayoutDashboard className="text-brand-600 dark:text-brand-500" size={32} />
//           {isClient ? "Mis Solicitudes" : "Panel de Operaciones"}
//         </h1>
//         <p className="text-slate-500 dark:text-slate-400 font-medium">
//           {isClient 
//             ? "Gestiona tus requerimientos y revisa el estado de tus tickets en tiempo real." 
//             : `Hola, ${session?.user?.name?.split(' ')[0]}. Tienes ${stats.pending} tickets esperando atención.`}
//         </p>
//       </div>

//       <StatsCards stats={stats} />

//       {!isClient && (
//         <div className="space-y-8">
//           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//             <div className="lg:col-span-2">
//               <TicketsTrendChart data={trendData} />
//             </div>
//             <div>
//               <CategoryDistributionChart data={categoryData} />
//             </div>
//           </div>

//           <div className="pt-4">
//             <div className="flex items-center gap-3 mb-6">
//               <div className="h-6 w-1 bg-brand-600 dark:bg-brand-500 rounded-full" />
//               <h2 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">
//                 Flujo de Trabajo (Kanban)
//               </h2>
//             </div>
//             {/* Ahora 'tickets' tiene los strings que KanbanBoard espera */}
//             <KanbanBoard initialTickets={tickets} supportUsers={supportUsers} />
//           </div>
//         </div>
//       )}

//       {isClient && (
//         <div className="pt-4">
//           <div className="flex justify-between items-end mb-6">
//             <div className="flex items-center gap-3">
//               <History className="text-brand-600 dark:text-brand-500" size={20} />
//               <h2 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">
//                 Actividad Reciente
//               </h2>
//             </div>
//             <Link 
//               href="/dashboard/tickets" 
//               className="text-xs font-bold text-brand-600 dark:text-brand-500 flex items-center gap-1 hover:gap-2 transition-all group"
//             >
//               Ver historial completo <ArrowRight size={14} />
//             </Link>
//           </div>
          
//           <div className="grid gap-3">
//             {tickets.slice(0, 5).map(ticket => (
//               <Link 
//                 key={ticket.id} 
//                 href={`/dashboard/tickets/${ticket.id}`}
//                 className="group flex justify-between items-center p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-brand-500 transition-all shadow-sm"
//               >
//                 <div className="space-y-1">
//                   <div className="flex items-center gap-2">
//                     <span className="text-[10px] font-black text-brand-600 dark:text-brand-500 px-2 py-0.5 bg-brand-50 dark:bg-brand-500/10 rounded">
//                       {ticket.folio}
//                     </span>
//                     <span className="text-xs text-slate-400 font-medium">
//                       {new Date(ticket.createdAt).toLocaleDateString()}
//                     </span>
//                   </div>
//                   <p className="font-bold text-slate-800 dark:text-slate-100 group-hover:text-brand-600 transition-colors">
//                     {ticket.title}
//                   </p>
//                 </div>

//                 <div className="flex items-center gap-4">
//                   <span 
//                     className="text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter border"
//                     style={{ 
//                       backgroundColor: `${ticket.statusColor}10`,
//                       color: ticket.statusColor,
//                       borderColor: `${ticket.statusColor}30`
//                     }}
//                   >
//                     {ticket.status}
//                   </span>
//                   <div className="p-2 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-300 group-hover:text-brand-500">
//                     <ArrowRight size={18} />
//                   </div>
//                 </div>
//               </Link>
//             ))}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }


// // src/app/dashboard/page.tsx
// import { auth } from "@/auth";
// import db from "@/lib/db";
// import KanbanBoard from "@/components/dashboard/kanban-board";
// import StatsCards from "@/components/dashboard/stats-cards";
// import TicketsTrendChart from "@/components/dashboard/tickets-trend-chart";
// import CategoryDistributionChart from "@/components/dashboard/category-distribution-chart";
// import { TicketStatus } from "@prisma/client";
// import Link from "next/link";
// import { ArrowRight, LayoutDashboard, History, TrendingUp } from "lucide-react";

// export default async function DashboardPage() {
//   const session = await auth();
//   const role = session?.user?.role;
//   const userId = session?.user?.id;
//   const isClient = role === "CONTACTO_CLIENTE";

//   // 1. Filtro base de tickets según Rol
//   const ticketsWhereClause = isClient 
//     ? { creatorId: userId } 
//     : { status: { in: ["PENDIENTE", "EN_PROCESO", "ESCALADO", "RESUELTO"] as TicketStatus[] } };

//   // 2. Consultas en paralelo para rendimiento optimizado
//   const [tickets, statsData, categoriesCount, recentActivity] = await Promise.all([
//     db.ticket.findMany({
//       where: ticketsWhereClause,
//       select: {
//         id: true, folio: true, title: true, status: true,
//         priority: true, category: true, createdAt: true,
//         client: { select: { name: true } }
//       },
//       orderBy: { updatedAt: 'desc' }
//     }),
//     // Estadísticas para las StatsCards
//     Promise.all([
//       db.ticket.count({ where: ticketsWhereClause }),
//       db.ticket.count({ where: { ...ticketsWhereClause, status: "PENDIENTE" } }),
//       db.ticket.count({ where: { ...ticketsWhereClause, priority: "URGENTE" } }),
//       db.ticket.count({ 
//         where: { 
//           ...ticketsWhereClause, 
//           status: "RESUELTO",
//           updatedAt: { gte: new Date(new Date().setHours(0,0,0,0)) }
//         } 
//       }),
//     ]),
//     // Datos para el gráfico de Donut (Categorías)
//     db.ticket.groupBy({
//       by: ['category'],
//       where: ticketsWhereClause,
//       _count: { _all: true },
//     }),
//     // Datos para el gráfico de Tendencia (últimos 7 días)
//     db.ticket.findMany({
//       where: {
//         ...ticketsWhereClause,
//         createdAt: { gte: new Date(new Date().setDate(new Date().getDate() - 7)) }
//       },
//       select: { createdAt: true, status: true }
//     })
//   ]);

//   const stats = {
//     total: statsData[0],
//     pending: statsData[1],
//     urgent: statsData[2],
//     resolvedToday: statsData[3]
//   };

//   // --- FORMATEO DE DATOS PARA GRÁFICAS ---
  
//   // Gráfico de Tendencia (Últimos 7 días)
//   const trendData = Array.from({ length: 7 }).map((_, i) => {
//     const d = new Date();
//     d.setDate(d.getDate() - (6 - i));
//     const dateStr = d.toLocaleDateString('es-CL', { day: '2-digit', month: 'short' });
    
//     return {
//       date: dateStr,
//       abiertos: recentActivity.filter(t => 
//         new Date(t.createdAt).toDateString() === d.toDateString()
//       ).length,
//       resueltos: recentActivity.filter(t => 
//         new Date(t.createdAt).toDateString() === d.toDateString() && t.status === "RESUELTO"
//       ).length,
//     };
//   });

//   // Gráfico de Categorías
//   const totalTickets = stats.total;
//   const categoryData = categoriesCount.map(c => ({
//     name: c.category.replace('_', ' '),
//     value: totalTickets > 0 ? Math.round((c._count._all / totalTickets) * 100) : 0,
//     color: c.category === "SOPORTE" ? "#0ea5e9" : c.category === "DESARROLLO" ? "#8b5cf6" : "#94a3b8"
//   }));

//   const supportUsers = await db.user.findMany({
//     where: {
//       role: { in: ["ADMIN", "SOPORTE", "DESARROLLO"] },
//       isActive: true,
//       providerId: session?.user?.providerId
//     },
//     select: { id: true, name: true },
//     orderBy: { name: 'asc' }
//   });

//   return (
//     <div className="space-y-8 pb-10 transition-colors duration-500">
//       <div className="flex flex-col gap-1">
//         <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter flex items-center gap-3">
//           <LayoutDashboard className="text-brand-600 dark:text-brand-500" size={32} />
//           {isClient ? "Mis Solicitudes" : "Panel de Operaciones"}
//         </h1>
//         <p className="text-slate-500 dark:text-slate-400 font-medium">
//           {isClient 
//             ? "Gestiona tus requerimientos y revisa el estado de tus tickets en tiempo real." 
//             : `Hola, ${session?.user?.name?.split(' ')[0]}. Tienes ${stats.pending} tickets esperando atención técnica.`}
//         </p>
//       </div>

//       <StatsCards stats={stats} />

//       {!isClient && (
//         <div className="space-y-8">
//           {/* SECCIÓN DE ANALÍTICA */}
//           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//             <div className="lg:col-span-2">
//               <TicketsTrendChart data={trendData} />
//             </div>
//             <div>
//               <CategoryDistributionChart data={categoryData} />
//             </div>
//           </div>

//           {/* KANBAN */}
//           <div className="pt-4">
//             <div className="flex items-center gap-3 mb-6">
//               <div className="h-6 w-1 bg-brand-600 dark:bg-brand-500 rounded-full" />
//               <h2 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">
//                 Flujo de Trabajo (Kanban)
//               </h2>
//             </div>
//             <KanbanBoard initialTickets={tickets} supportUsers={supportUsers} />
//           </div>
//         </div>
//       )}

//       {isClient && (
//         <div className="pt-4">
//           <div className="flex justify-between items-end mb-6">
//             <div className="flex items-center gap-3">
//               <History className="text-brand-600 dark:text-brand-500" size={20} />
//               <h2 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">
//                 Actividad Reciente
//               </h2>
//             </div>
//             <Link 
//               href="/dashboard/tickets" 
//               className="text-xs font-bold text-brand-600 dark:text-brand-500 flex items-center gap-1 hover:gap-2 transition-all group"
//             >
//               Ver historial completo <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
//             </Link>
//           </div>
          
//           <div className="grid gap-3">
//             {tickets.slice(0, 5).map(ticket => (
//               <Link 
//                 key={ticket.id} 
//                 href={`/dashboard/tickets/${ticket.id}`}
//                 className="group flex justify-between items-center p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-brand-500 dark:hover:border-brand-500 transition-all shadow-sm hover:shadow-md"
//               >
//                 <div className="space-y-1">
//                   <div className="flex items-center gap-2">
//                     <span className="text-[10px] font-black text-brand-600 dark:text-brand-500 px-2 py-0.5 bg-brand-50 dark:bg-brand-500/10 rounded">
//                       {ticket.folio}
//                     </span>
//                     <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
//                       {new Date(ticket.createdAt).toLocaleDateString()}
//                     </span>
//                   </div>
//                   <p className="font-bold text-slate-800 dark:text-slate-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
//                     {ticket.title}
//                   </p>
//                 </div>

//                 <div className="flex items-center gap-4">
//                   <span className="text-[10px] font-black px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase tracking-tighter border border-transparent dark:border-slate-700">
//                     {ticket.status.replace('_', ' ')}
//                   </span>
//                   <div className="p-2 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-300 group-hover:text-brand-500 transition-colors">
//                     <ArrowRight size={18} />
//                   </div>
//                 </div>
//               </Link>
//             ))}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
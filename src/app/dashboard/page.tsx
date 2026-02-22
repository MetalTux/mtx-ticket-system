// src/app/dashboard/page.tsx
import { auth } from "@/auth";
import db from "@/lib/db";
import KanbanBoard from "@/components/dashboard/kanban-board";
import StatsCards from "@/components/dashboard/stats-cards";
import TicketsTrendChart from "@/components/dashboard/tickets-trend-chart";
import CategoryDistributionChart from "@/components/dashboard/category-distribution-chart";
import { TicketStatus } from "@prisma/client";
import Link from "next/link";
import { ArrowRight, LayoutDashboard, History, TrendingUp } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();
  const role = session?.user?.role;
  const userId = session?.user?.id;
  const isClient = role === "CONTACTO_CLIENTE";

  // 1. Filtro base de tickets según Rol
  const ticketsWhereClause = isClient 
    ? { creatorId: userId } 
    : { status: { in: ["PENDIENTE", "EN_PROCESO", "ESCALADO", "RESUELTO"] as TicketStatus[] } };

  // 2. Consultas en paralelo para rendimiento optimizado
  const [tickets, statsData, categoriesCount, recentActivity] = await Promise.all([
    db.ticket.findMany({
      where: ticketsWhereClause,
      select: {
        id: true, folio: true, title: true, status: true,
        priority: true, category: true, createdAt: true,
        client: { select: { name: true } }
      },
      orderBy: { updatedAt: 'desc' }
    }),
    // Estadísticas para las StatsCards
    Promise.all([
      db.ticket.count({ where: ticketsWhereClause }),
      db.ticket.count({ where: { ...ticketsWhereClause, status: "PENDIENTE" } }),
      db.ticket.count({ where: { ...ticketsWhereClause, priority: "URGENTE" } }),
      db.ticket.count({ 
        where: { 
          ...ticketsWhereClause, 
          status: "RESUELTO",
          updatedAt: { gte: new Date(new Date().setHours(0,0,0,0)) }
        } 
      }),
    ]),
    // Datos para el gráfico de Donut (Categorías)
    db.ticket.groupBy({
      by: ['category'],
      where: ticketsWhereClause,
      _count: { _all: true },
    }),
    // Datos para el gráfico de Tendencia (últimos 7 días)
    db.ticket.findMany({
      where: {
        ...ticketsWhereClause,
        createdAt: { gte: new Date(new Date().setDate(new Date().getDate() - 7)) }
      },
      select: { createdAt: true, status: true }
    })
  ]);

  const stats = {
    total: statsData[0],
    pending: statsData[1],
    urgent: statsData[2],
    resolvedToday: statsData[3]
  };

  // --- FORMATEO DE DATOS PARA GRÁFICAS ---
  
  // Gráfico de Tendencia (Últimos 7 días)
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
        new Date(t.createdAt).toDateString() === d.toDateString() && t.status === "RESUELTO"
      ).length,
    };
  });

  // Gráfico de Categorías
  const totalTickets = stats.total;
  const categoryData = categoriesCount.map(c => ({
    name: c.category.replace('_', ' '),
    value: totalTickets > 0 ? Math.round((c._count._all / totalTickets) * 100) : 0,
    color: c.category === "SOPORTE" ? "#0ea5e9" : c.category === "DESARROLLO" ? "#8b5cf6" : "#94a3b8"
  }));

  const supportUsers = await db.user.findMany({
    where: {
      role: { in: ["ADMIN", "SOPORTE", "DESARROLLO"] },
      isActive: true,
      providerId: session?.user?.providerId
    },
    select: { id: true, name: true },
    orderBy: { name: 'asc' }
  });

  return (
    <div className="space-y-8 pb-10 transition-colors duration-500">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter flex items-center gap-3">
          <LayoutDashboard className="text-brand-600 dark:text-brand-500" size={32} />
          {isClient ? "Mis Solicitudes" : "Panel de Operaciones"}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium">
          {isClient 
            ? "Gestiona tus requerimientos y revisa el estado de tus tickets en tiempo real." 
            : `Hola, ${session?.user?.name?.split(' ')[0]}. Tienes ${stats.pending} tickets esperando atención técnica.`}
        </p>
      </div>

      <StatsCards stats={stats} />

      {!isClient && (
        <div className="space-y-8">
          {/* SECCIÓN DE ANALÍTICA */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <TicketsTrendChart data={trendData} />
            </div>
            <div>
              <CategoryDistributionChart data={categoryData} />
            </div>
          </div>

          {/* KANBAN */}
          <div className="pt-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-6 w-1 bg-brand-600 dark:bg-brand-500 rounded-full" />
              <h2 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">
                Flujo de Trabajo (Kanban)
              </h2>
            </div>
            <KanbanBoard initialTickets={tickets} supportUsers={supportUsers} />
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
              Ver historial completo <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          <div className="grid gap-3">
            {tickets.slice(0, 5).map(ticket => (
              <Link 
                key={ticket.id} 
                href={`/dashboard/tickets/${ticket.id}`}
                className="group flex justify-between items-center p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-brand-500 dark:hover:border-brand-500 transition-all shadow-sm hover:shadow-md"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-brand-600 dark:text-brand-500 px-2 py-0.5 bg-brand-50 dark:bg-brand-500/10 rounded">
                      {ticket.folio}
                    </span>
                    <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="font-bold text-slate-800 dark:text-slate-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                    {ticket.title}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-[10px] font-black px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase tracking-tighter border border-transparent dark:border-slate-700">
                    {ticket.status.replace('_', ' ')}
                  </span>
                  <div className="p-2 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-300 group-hover:text-brand-500 transition-colors">
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
// import { TicketStatus } from "@prisma/client";
// import Link from "next/link";
// import { ArrowRight, LayoutDashboard, History } from "lucide-react";

// export default async function DashboardPage() {
//   const session = await auth();
//   const role = session?.user?.role;
//   const userId = session?.user?.id;
//   const isClient = role === "CONTACTO_CLIENTE";

//   // 1. Filtro base de tickets según Rol
//   const ticketsWhereClause = isClient 
//     ? { creatorId: userId } 
//     : { status: { in: ["PENDIENTE", "EN_PROCESO", "ESCALADO", "RESUELTO"] as TicketStatus[] } };

//   const tickets = await db.ticket.findMany({
//     where: ticketsWhereClause,
//     select: {
//       id: true,
//       folio: true,
//       title: true,
//       status: true,
//       priority: true,
//       category: true,
//       createdAt: true,
//       client: { select: { name: true } }
//     },
//     orderBy: { updatedAt: 'desc' }
//   });

//   // 2. Estadísticas segmentadas
//   const [totalActivos, pendientes, urgentes, resueltosHoy] = await Promise.all([
//     db.ticket.count({ where: ticketsWhereClause }),
//     db.ticket.count({ where: { ...ticketsWhereClause, status: "PENDIENTE" } }),
//     db.ticket.count({ where: { ...ticketsWhereClause, priority: "URGENTE" } }),
//     db.ticket.count({ 
//       where: { 
//         ...ticketsWhereClause, 
//         status: "RESUELTO",
//         updatedAt: { gte: new Date(new Date().setHours(0,0,0,0)) }
//       } 
//     }),
//   ]);

//   const stats = {
//     total: totalActivos,
//     pending: pendientes,
//     urgent: urgentes,
//     resolvedToday: resueltosHoy
//   };

//   const supportUsers = await db.user.findMany({
//     where: {
//       role: { in: ["ADMIN", "SOPORTE", "DESARROLLO"] },
//       isActive: true,
//       providerId: session?.user?.providerId // Filtramos por la misma proveedora
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
//             : `Hola, ${session?.user?.name?.split(' ')[0]}. Tienes ${pendientes} tickets esperando atención técnica.`}
//         </p>
//       </div>

//       {/* Widgets de Estadísticas */}
//       <StatsCards stats={stats} />

//       {/* Renderizado Condicional por Rol */}
//       {!isClient ? (
//         <div className="pt-4">
//           <div className="flex items-center gap-3 mb-6">
//             <div className="h-6 w-1 bg-brand-600 dark:bg-brand-500 rounded-full" />
//             <h2 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">
//               Flujo de Trabajo (Kanban)
//             </h2>
//           </div>
//           <KanbanBoard initialTickets={tickets} supportUsers={supportUsers} />
//         </div>
//       ) : (
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
          
//           {/* Vista de lista para Clientes */}
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
//                       #{ticket.id.slice(-6).toUpperCase()}
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
//                   <span className="text-[10px] font-black px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase tracking-tighter">
//                     {ticket.status.replace('_', ' ')}
//                   </span>
//                   <div className="p-2 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-300 group-hover:text-brand-500 transition-colors">
//                     <ArrowRight size={18} />
//                   </div>
//                 </div>
//               </Link>
//             ))}

//             {tickets.length === 0 && (
//               <div className="flex flex-col items-center justify-center p-16 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl space-y-3">
//                 <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-full">
//                   <TicketStatusIcon status="NONE" className="w-8 h-8 text-slate-300" />
//                 </div>
//                 <p className="text-sm font-medium text-slate-400 dark:text-slate-500 italic">
//                   No tienes tickets activos en este momento.
//                 </p>
//               </div>
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// // Helper pequeño para el icono de vacío (puedes moverlo a un archivo de iconos si gustas)
// function TicketStatusIcon({ status, className }: { status: string, className: string }) {
//   return (
//     <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
//        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
//     </svg>
//   );
// }
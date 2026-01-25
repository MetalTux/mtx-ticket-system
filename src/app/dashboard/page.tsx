// src/app/dashboard/page.tsx
import { auth } from "@/auth";
import db from "@/lib/db";
import KanbanBoard from "@/components/dashboard/kanban-board";
import StatsCards from "@/components/dashboard/stats-cards";
import { TicketStatus } from "@prisma/client";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();
  const role = session?.user?.role;
  const userId = session?.user?.id;
  const isClient = role === "CONTACTO_CLIENTE";

  // 1. Filtro base de tickets según Rol
  // El cliente solo ve lo suyo. El soporte ve todo lo activo.
  const ticketsWhereClause = isClient 
    ? { creatorId: userId } 
    : { status: { in: ["PENDIENTE", "EN_PROCESO", "ESCALADO", "RESUELTO"] as TicketStatus[] } };

  const tickets = await db.ticket.findMany({
    where: ticketsWhereClause,
    select: {
      id: true,
      folio: true,
      title: true,
      status: true,
      priority: true,
      category: true,
      createdAt: true,
      client: { select: { name: true } }
    },
    orderBy: { updatedAt: 'desc' }
  });

  // 2. Estadísticas segmentadas
  const [totalActivos, pendientes, urgentes, resueltosHoy] = await Promise.all([
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
  ]);

  const stats = {
    total: totalActivos,
    pending: pendientes,
    urgent: urgentes,
    resolvedToday: resueltosHoy
  };

  return (
    <div className="space-y-8 pb-10">
      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          {isClient ? "Mis Solicitudes" : "Panel de Operaciones"}
        </h1>
        <p className="text-slate-500 font-medium">
          {isClient 
            ? "Gestiona tus requerimientos y revisa el estado de tus tickets." 
            : `Hola, ${session?.user?.name}. Tienes ${pendientes} tickets esperando atención.`}
        </p>
      </div>

      {/* Widgets (Comunes para ambos, pero con datos filtrados) */}
      <StatsCards stats={stats} />

      {/* Renderizado Condicional por Rol */}
      {!isClient ? (
        <div className="pt-4">
          <div className="flex items-center gap-2 mb-6">
            <div className="h-1 w-8 bg-brand-500 rounded-full" />
            <h2 className="text-lg font-bold text-slate-800 dark:text-white uppercase tracking-wider">
              Flujo de Trabajo
            </h2>
          </div>
          <KanbanBoard initialTickets={tickets} />
        </div>
      ) : (
        <div className="pt-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white uppercase tracking-wider italic">
              Últimas actualizaciones
            </h2>
            <Link href="/dashboard/tickets" className="text-sm text-brand-600 font-bold flex items-center gap-1 hover:underline">
              Ver todos mis tickets <ArrowRight size={16}/>
            </Link>
          </div>
          
          {/* Vista simplificada para Clientes */}
          <div className="grid gap-4">
            {tickets.slice(0, 5).map(ticket => (
              <Link 
                key={ticket.id} 
                href={`/dashboard/tickets/${ticket.id}`}
                className="card-module p-4 flex justify-between items-center hover:border-brand-300 transition-all"
              >
                <div>
                  <p className="text-xs text-slate-400 font-bold mb-1">#{ticket.id.slice(-6).toUpperCase()}</p>
                  <p className="font-bold text-slate-800 dark:text-white">{ticket.title}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600`}>
                    {ticket.status}
                  </span>
                  <ArrowRight size={18} className="text-slate-300" />
                </div>
              </Link>
            ))}
            {tickets.length === 0 && (
              <div className="p-10 text-center border-2 border-dashed rounded-2xl text-slate-400">
                No tienes tickets activos en este momento.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
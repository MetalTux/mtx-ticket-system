// src/app/dashboard/page.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import db from "@/lib/db";
import TicketStatusBoard from "@/components/dashboard/ticket-status-board"; // NUEVO IMPORT
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

  if (!providerId || !userId) return <div>Error: No se encontró identificador de proveedor.</div>;

  const [masters, dbUser] = await Promise.all([
    getTicketMasters(),
    (role !== "ADMIN" && !isClient) 
      ? db.user.findUnique({
          where: { id: userId },
          select: { allowedCategories: { select: { id: true } } }
        })
      : Promise.resolve(null)
  ]);

  if ("error" in masters) return <div>Error cargando configuración.</div>;

  let rbacWhere: Prisma.TicketWhereInput = {};
  
  if (isClient) {
    rbacWhere = { clientId: session.user.clientId || "" };
  } else if (role !== "ADMIN") {
    const allowedCategoryIds = dbUser?.allowedCategories.map(c => c.id) || [];
    rbacWhere = {
      OR: [
        { creatorId: userId },
        { createdById: userId },
        { assignedToId: userId },
        { categoryId: { in: allowedCategoryIds } }
      ]
    };
  }

  const ticketsWhereClause: Prisma.TicketWhereInput = {
    providerId: providerId,
    ...rbacWhere
  };

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

    db.ticket.groupBy({
      by: ['statusId'],
      where: ticketsWhereClause,
      _count: { _all: true }
    })
  ]);

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

  const ticketsForKanban = ticketsRaw.map(t => ({
    id: t.id,
    folio: t.folio || "",
    title: t.title,
    statusId: t.statusId,
    statusName: t.status.name,
    priority: t.priority.name,
    priorityColor: t.priority.color,
    // Agregamos los dos campos que TypeScript está pidiendo:
    prioritySystemKey: t.priority.systemKey, 
    updatedAt: t.updatedAt,
    category: t.category.name,
    client: { name: t.client.name }
  }));

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

  const categoryData = categoriesCount.map(c => {
    const cat = masters.categories.find(m => m.id === c.categoryId);
    return {
      name: cat?.name || "Otras",
      value: stats.total > 0 ? Math.round((c._count._all / stats.total) * 100) : 0,
      color: "#0ea5e9"
    }
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
                Estado Actual de Tickets
              </h2>
            </div>
            {/* NUEVO COMPONENTE: Tablero estático de acceso rápido */}
            <TicketStatusBoard 
              tickets={ticketsForKanban} 
              statuses={masters.statuses} 
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
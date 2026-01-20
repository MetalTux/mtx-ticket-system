// src/app/dashboard/page.tsx
import { auth } from "@/auth";
import db from "@/lib/db";
import { Prisma, TicketStatus } from "@prisma/client"; // Importamos los tipos necesarios
import Link from "next/link";

export default async function DashboardPage() {
  const session = await auth();
  const user = session?.user;

  // 1. Construimos el filtro de forma tipada
  // Usamos Prisma.TicketWhereInput para que TS sepa exactamente qué estamos armando
  const whereClause: Prisma.TicketWhereInput = user?.role === "ADMIN" 
    ? {} 
    : { clientId: user?.clientId ?? undefined }; // Si es null, pasamos undefined

  // 2. Obtenemos métricas rápidas usando los Enums correctos
  const [totalTickets, openTickets, closedTickets] = await Promise.all([
    db.ticket.count({ where: whereClause }),
    db.ticket.count({ 
      where: { 
        ...whereClause, 
        status: TicketStatus.PENDIENTE // Usamos el Enum en lugar de un string
      } 
    }),
    db.ticket.count({ 
      where: { 
        ...whereClause, 
        status: TicketStatus.CERRADO // Usamos el Enum en lugar de un string
      } 
    }),
  ]);

  return (
    <div className="space-y-8">
      {/* Cabecera */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Resumen General</h1>
        <p className="text-slate-500 dark:text-slate-400 italic">
          Sesión iniciada como: <span className="font-semibold text-brand-600">{user?.name}</span>
        </p>
      </div>

      {/* Grid de Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card-module">
          <p className="text-sm font-medium text-slate-500">Tickets Totales</p>
          <p className="text-3xl font-bold mt-2">{totalTickets}</p>
        </div>
        <div className="card-module border-l-4 border-l-amber-500">
          <p className="text-sm font-medium text-slate-500">Pendientes de Atención</p>
          <p className="text-3xl font-bold text-amber-600 mt-2">{openTickets}</p>
        </div>
        <div className="card-module border-l-4 border-l-green-500">
          <p className="text-sm font-medium text-slate-500">Resueltos</p>
          <p className="text-3xl font-bold text-green-600 mt-2">{closedTickets}</p>
        </div>
      </div>

      {/* Acción Rápida */}
      <div className="card-module flex flex-col md:flex-row items-center justify-between gap-4 border-dashed border-2">
        <div>
          <h3 className="text-lg font-bold">Panel de Operaciones</h3>
          <p className="text-sm text-slate-500">
            {user?.role === "ADMIN" 
              ? "Tienes acceso a la gestión global de tickets." 
              : "Visualiza y gestiona los tickets de tu organización."}
          </p>
        </div>
        <Link href="/dashboard/tickets/new" className="btn-primary">
          + Nuevo Ticket
        </Link>
      </div>
    </div>
  );
}
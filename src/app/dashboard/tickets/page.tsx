// src/app/dashboard/tickets/page.tsx
import { auth } from "@/auth";
import db from "@/lib/db";
import { Prisma, TicketStatus, Priority } from "@prisma/client";
import Link from "next/link";

export default async function TicketsPage() {
  const session = await auth();
  const user = session?.user;

  // Filtro de seguridad (Igual que en el dashboard)
  const whereClause: Prisma.TicketWhereInput = user?.role === "ADMIN" 
    ? {} 
    : { clientId: user?.clientId ?? undefined };

  // Obtenemos los tickets ordenados por los más recientes
  const tickets = await db.ticket.findMany({
    where: whereClause,
    orderBy: { createdAt: 'desc' },
    include: {
      client: true, // Para ver el nombre de la empresa
      creator: true, // Para ver quién lo creó
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Gestión de Tickets</h1>
          <p className="text-slate-500">Administra y haz seguimiento a las solicitudes.</p>
        </div>
        <Link href="/dashboard/tickets/new" className="btn-primary">
          + Nuevo Ticket
        </Link>
      </div>

      <div className="card-module !p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
            <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-800 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-4 font-semibold">Título</th>
                <th className="px-6 py-4 font-semibold">Estado</th>
                <th className="px-6 py-4 font-semibold">Prioridad</th>
                <th className="px-6 py-4 font-semibold">Empresa</th>
                <th className="px-6 py-4 font-semibold">Fecha</th>
                <th className="px-6 py-4 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {tickets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-slate-400">
                    No se encontraron tickets registrados.
                  </td>
                </tr>
              ) : (
                tickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-medium text-slate-900 dark:text-white block">
                        {ticket.title}
                      </span>
                      <span className="text-xs text-slate-400">ID: {ticket.id.slice(-8)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={ticket.status} />
                    </td>
                    <td className="px-6 py-4">
                      <PriorityBadge priority={ticket.priority} />
                    </td>
                    <td className="px-6 py-4">
                      {ticket.client?.name || "N/A"}
                    </td>
                    <td className="px-6 py-4">
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link 
                        href={`/dashboard/tickets/${ticket.id}`}
                        className="text-brand-600 hover:text-brand-700 font-semibold"
                      >
                        Ver detalle
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

// Sub-componentes visuales para la tabla
function StatusBadge({ status }: { status: TicketStatus }) {
  const styles: Record<TicketStatus, string> = {
    PENDIENTE: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400",
    EN_PROCESO: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400",
    ESCALADO: "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400",
    RESUELTO: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400",
    CERRADO: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400",
    CANCELADO: "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400",
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status]}`}>
      {status.replace('_', ' ')}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: Priority }) {
  const styles: Record<Priority, string> = {
    URGENTE: "text-red-700 dark:text-red-500 font-bold",
    ALTA: "text-red-600 dark:text-red-400 font-semibold",
    MEDIA: "text-amber-600 dark:text-amber-400 font-medium",
    BAJA: "text-slate-500 dark:text-slate-400 font-normal",
  };
  return (
    <div className="flex items-center gap-1.5">
      <div className={`w-1.5 h-1.5 rounded-full bg-current ${styles[priority]}`} />
      <span className={`text-xs font-medium ${styles[priority]}`}>{priority}</span>
    </div>
  );
}
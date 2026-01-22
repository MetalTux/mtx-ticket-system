// src/app/dashboard/tickets/[id]/page.tsx
import { auth } from "@/auth";
import db from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import TicketAttachments from "@/components/tickets/ticket-attachments";
import TicketManagementPanel from "@/components/tickets/ticket-management-panel";

interface Attachment {
  url: string;
  name: string;
}

const getPriorityBadge = (priority: string) => {
  const styles: Record<string, string> = {
    BAJA: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30",
    MEDIA: "bg-blue-100 text-blue-700 dark:bg-blue-900/30",
    ALTA: "bg-orange-100 text-orange-700 dark:bg-orange-900/30",
    URGENTE: "bg-red-100 text-red-700 dark:bg-red-900/30 animate-pulse",
  };
  return styles[priority] || "bg-slate-100 text-slate-700";
};

const getStatusBadge = (status: string) => {
  const styles: Record<string, string> = {
    PENDIENTE: "border-slate-300 text-slate-600",
    EN_PROCESO: "border-blue-500 text-blue-600",
    RESUELTO: "border-emerald-500 text-emerald-600 bg-emerald-50 dark:bg-emerald-900/10",
    CERRADO: "bg-slate-200 text-slate-500 dark:bg-slate-700",
  };
  return styles[status] || "border-slate-300";
};

export default async function TicketDetailPage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session || !session.user) return <div>No autorizado</div>;

  const { id } = await params;

  // 1. Buscamos el ticket con todas sus relaciones
  const ticket = await db.ticket.findUnique({
    where: { id },
    include: {
      creator: true,
      client: true,
      history: {
        include: { user: true },
        orderBy: { createdAt: "asc" }
      }
    },
  });

  if (!ticket) notFound();

  // 2. Buscamos los usuarios a los que se les puede asignar el ticket
  // Filtramos por roles que pertenecen al equipo de soporte/proveedor
  const supportUsers = await db.user.findMany({
    where: {
      role: { in: ["ADMIN", "SOPORTE", "DESARROLLO", "VENTAS"] },
      providerId: ticket.providerId // Solo usuarios de la misma empresa proveedora
    },
    orderBy: { name: "asc" }
  });

  const isProviderUser = session.user.role !== "CONTACTO_CLIENTE";

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-8">
      {/* Botón Volver */}
      <Link href="/dashboard/tickets" className="text-sm text-brand-600 hover:underline flex items-center gap-2">
        ← Volver a la lista de tickets
      </Link>

      <div className="grid grid-cols-1 gap-8">
        {/* SECCIÓN 1: CABECERA Y DESCRIPCIÓN ORIGINAL */}
        <div className="card-module">
          <div className="flex justify-between items-start border-b pb-4 mb-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{ticket.title}</h1>
              <p className="text-sm text-slate-500">Ticket #{ticket.id.slice(-6).toUpperCase()}</p>
            </div>
            <div className="flex gap-2">
              <span className="badge-status">{ticket.status}</span>
              <span className="badge-priority">{ticket.priority}</span>
            </div>
          </div>

          <div className="prose dark:prose-invert max-w-none">
            <div dangerouslySetInnerHTML={{ __html: ticket.description }} />
          </div>

          {/* Adjuntos originales del ticket */}
          {ticket.attachments && (
            <div className="mt-6">
              <TicketAttachments attachments={ticket.attachments as unknown as Attachment[]} />
            </div>
          )}
        </div>

        {/* SECCIÓN 2: LÍNEA DE TIEMPO (Conversación) */}
        <div className="space-y-4">
          <h3 className="font-bold text-lg text-slate-900 dark:text-white px-2">Actividad y Respuestas</h3>
          {ticket.history.map((entry) => (
            <div 
              key={entry.id} 
              className={`p-5 rounded-xl border ${
                entry.isInternal ? "bg-amber-50/50 border-amber-200" : "bg-white dark:bg-slate-800 border-slate-200"
              }`}
            >
              <div className="flex justify-between mb-3">
                <span className="font-bold text-sm">{entry.user.name}</span>
                <span className="text-xs text-slate-500">{new Date(entry.createdAt).toLocaleString()}</span>
              </div>
              <div className="prose prose-sm dark:prose-invert" dangerouslySetInnerHTML={{ __html: entry.comment || "" }} />
              
              {entry.attachments && (
                <div className="mt-4">
                  <TicketAttachments attachments={entry.attachments as unknown as Attachment[]} />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* SECCIÓN 3: PANEL DE GESTIÓN (Donde agregas el nuevo componente) */}
        {ticket.status !== "CERRADO" && (
          <div className="mt-4">
            <TicketManagementPanel 
              key={ticket.updatedAt.getTime()}
              ticket={ticket} 
              supportUsers={supportUsers}
              userRole={session.user.role}
            />
          </div>
        )}
      </div>
    </div>
  );
}
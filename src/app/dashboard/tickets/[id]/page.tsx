// src/app/dashboard/tickets/[id]/page.tsx
import { auth } from "@/auth";
import db from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import TicketAttachments from "@/components/tickets/ticket-attachments";
import TicketManagementPanel from "@/components/tickets/ticket-management-panel";
import { STATUS_LABELS, PRIORITY_LABELS, CATEGORY_LABELS } from "@/enums/constantes";
import { Calendar, User, Building2, Tag, ShieldCheck } from "lucide-react";

interface Attachment {
  url: string;
  name: string;
}

export default async function TicketDetailPage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session || !session.user) return <div>No autorizado</div>;

  const { id } = await params;

  // 1. Buscamos el ticket con todas sus relaciones, incluyendo el nuevo campo "createdBy"
  const ticket = await db.ticket.findUnique({
    where: { id },
    include: {
      creator: true,    // El solicitante (Contacto Cliente)
      createdBy: true,  // El registrador (Soporte o Cliente)
      client: true,     // La empresa
      assignedTo: true, // A quién está asignado
      history: {
        include: { user: true },
        orderBy: { createdAt: "asc" }
      }
    },
  });

  if (!ticket) notFound();

  const supportUsers = await db.user.findMany({
    where: {
      role: { in: ["ADMIN", "SOPORTE", "DESARROLLO", "VENTAS"] },
      providerId: ticket.providerId 
    },
    orderBy: { name: "asc" }
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6 py-6 px-4">
      {/* Navegación superior */}
      <div className="flex justify-between items-center">
        <Link href="/dashboard/tickets" className="text-sm text-slate-500 hover:text-brand-600 flex items-center gap-2 transition-colors">
          ← Volver a la lista de tickets
        </Link>
        <div className="flex items-center gap-3">
           <span className={`px-3 py-1 rounded-full text-xs font-bold border ${ticket.status === 'PENDIENTE' ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-blue-50 text-blue-600 border-blue-200'}`}>
            {STATUS_LABELS[ticket.status]}
           </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* COLUMNA IZQUIERDA: Contenido del Ticket y Conversación (8/12) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="card-module">
            <div className="border-b dark:border-slate-800 pb-4 mb-6">
              <div className="flex flex-col gap-2 mb-4">
                {/* Visualización del Folio */}
                <div className="flex items-center gap-2">
                  <span className="bg-slate-900 text-white dark:bg-brand-600 px-3 py-1 rounded text-sm font-black tracking-widest shadow-sm">
                    Folio: {ticket.folio}
                  </span>
                  {/* <span className="text-slate-400 text-xs font-medium uppercase tracking-tighter">
                    Identificador Único de Atención
                  </span> */}
                </div>
                
                <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">
                  {ticket.title}
                </h1>
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                <span className="flex items-center gap-1.5"><Calendar size={14}/> {new Date(ticket.createdAt).toLocaleString()}</span>
                <span className="flex items-center gap-1.5"><Tag size={14}/> {CATEGORY_LABELS[ticket.category]}</span>
              </div>
            </div>

            <div className="prose dark:prose-invert max-w-none mb-8">
              <div dangerouslySetInnerHTML={{ __html: ticket.description }} />
            </div>

            {ticket.attachments && (
              <div className="pt-6 border-t dark:border-slate-800">
                <h4 className="text-sm font-bold mb-3 text-slate-400 uppercase tracking-wider">Archivos adjuntos iniciales</h4>
                <TicketAttachments attachments={ticket.attachments as unknown as Attachment[]} />
              </div>
            )}
          </div>

          {/* HISTORIAL / CONVERSACIÓN */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200 flex items-center gap-2">
               Actividad del Ticket
            </h3>
            {ticket.history.map((entry) => (
              <div 
                key={entry.id} 
                className={`p-5 rounded-2xl border transition-shadow hover:shadow-sm ${
                  entry.isInternal ? "bg-amber-50/40 border-amber-200" : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                }`}
              >
                <div className="flex justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold">
                      {entry.user.name?.charAt(0)}
                    </div>
                    <span className="font-bold text-sm text-slate-900 dark:text-white">{entry.user.name}</span>
                    {entry.isInternal && <span className="text-[10px] bg-amber-200 text-amber-800 px-1.5 py-0.5 rounded font-bold">INTERNO</span>}
                  </div>
                  <span className="text-xs text-slate-400">{new Date(entry.createdAt).toLocaleString()}</span>
                </div>
                <div className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: entry.comment || "" }} />
                
                {entry.attachments && (
                  <div className="mt-4">
                    <TicketAttachments attachments={entry.attachments as unknown as Attachment[]} />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* PANEL DE GESTIÓN / RESPUESTA */}
          {ticket.status !== "CERRADO" && (
            <div className="pt-4">
              <TicketManagementPanel 
                key={ticket.updatedAt.getTime()}
                ticket={ticket} 
                supportUsers={supportUsers}
                userRole={session.user.role || "CONTACTO_CLIENTE"}
              />
            </div>
          )}
        </div>

        {/* COLUMNA DERECHA: Sidebar de Metadatos (4/12) */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="card-module space-y-6">
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Información del Cliente</h4>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1 text-brand-600"><Building2 size={18}/></div>
                  <div>
                    <p className="text-xs text-slate-500">Empresa</p>
                    <p className="text-sm font-bold text-slate-800 dark:text-white">{ticket.client.name}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1 text-brand-600"><User size={18}/></div>
                  <div>
                    <p className="text-xs text-slate-500">Solicitante (Contacto)</p>
                    <p className="text-sm font-bold text-slate-800 dark:text-white">{ticket.creator.name}</p>
                    <p className="text-xs text-slate-400">{ticket.creator.email}</p>
                  </div>
                </div>
                {/* Trazabilidad: Quién registró el ticket */}
                {ticket.createdById !== ticket.creatorId && (
                  <div className="flex items-start gap-3 bg-blue-50 dark:bg-blue-900/10 p-2 rounded-lg border border-blue-100 dark:border-blue-900/30">
                    <div className="mt-1 text-blue-600"><ShieldCheck size={18}/></div>
                    <div>
                      <p className="text-xs text-blue-700 dark:text-blue-400 font-bold">Registro Externo</p>
                      <p className="text-[11px] text-blue-600 dark:text-blue-300">Ingresado por soporte: <br/>{ticket.createdBy.name}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t dark:border-slate-800 pt-6">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Clasificación</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">Prioridad:</span>
                  <span className={`text-xs font-bold ${ticket.priority === 'URGENTE' ? 'text-red-500' : 'text-slate-700 dark:text-slate-200'}`}>
                    {PRIORITY_LABELS[ticket.priority]}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">Asignado a:</span>
                  <span className="text-sm font-bold text-slate-800 dark:text-white">
                    {ticket.assignedTo?.name || "Sin asignar"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
}
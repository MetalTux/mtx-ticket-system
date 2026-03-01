// src/app/dashboard/tickets/[id]/page.tsx
import { auth } from "@/auth";
import db from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import TicketAttachments from "@/components/tickets/ticket-attachments";
import TicketManagementPanel from "@/components/tickets/ticket-management-panel";
import { STATUS_LABELS, PRIORITY_LABELS, CATEGORY_LABELS } from "@/enums/constantes";
import { Calendar, User, Building2, Tag, ShieldCheck, ArrowLeft, Clock } from "lucide-react";

interface Attachment {
  url: string;
  name: string;
}

export default async function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || !session.user) return <div className="p-10 text-center text-slate-500 font-bold">No autorizado</div>;

  const { id } = await params;

  const ticket = await db.ticket.findUnique({
    where: { id },
    include: {
      creator: true,
      createdBy: true,
      client: true,
      assignedTo: true,
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
    <div className="max-w-7xl mx-auto space-y-2 lg:space-y-6 py-2 lg:py-8 px-3 lg:px-8 transition-colors duration-300">
      
      {/* Cabecera Compacta */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-4 lg:pb-6">
        <Link href="/dashboard/tickets" className="group text-[11px] lg:text-sm font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:text-brand-600 flex items-center gap-2 transition-all">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Volver
        </Link>
        <div className="flex items-center gap-2 w-full lg:w-auto">
           <span className={`flex-1 lg:flex-none text-center px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm ${
             ticket.status === 'PENDIENTE' 
             ? 'bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-500/30' 
             : 'bg-brand-50 text-brand-600 border-brand-200 dark:bg-brand-900/20 dark:text-brand-400 dark:border-brand-500/30'
           }`}>
            {STATUS_LABELS[ticket.status]}
           </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-8">
        
        {/* COLUMNA PRINCIPAL */}
        <div className="lg:col-span-8 space-y-2 lg:space-y-8 order-2 lg:order-1">
          <div className="card-module bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm !p-4 lg:!p-8">
            <div className="space-y-3 mb-6 lg:mb-8">
              <div className="flex items-center gap-3">
                <span className="bg-slate-900 text-white dark:bg-brand-600 px-2.5 py-1 rounded text-[10px] font-black tracking-widest">
                  #{ticket.folio}
                </span>
                <div className="flex items-center gap-1.5 text-slate-400">
                   <Clock size={12}/>
                   <span className="text-[10px] font-bold uppercase tracking-tight">
                     {new Date(ticket.createdAt).toLocaleDateString()}
                   </span>
                </div>
              </div>
              
              <h1 className="text-xl lg:text-3xl font-black text-slate-900 dark:text-white leading-tight tracking-tight">
                {ticket.title}
              </h1>

              <div className="flex flex-wrap gap-2 text-[9px] lg:text-xs font-black uppercase tracking-widest text-slate-500">
                <span className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                  <Tag size={12} className="text-brand-500"/> {CATEGORY_LABELS[ticket.category]}
                </span>
                <span className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                  <ShieldCheck size={12} className="text-brand-500"/> {PRIORITY_LABELS[ticket.priority]}
                </span>
              </div>
            </div>

            <div className="prose prose-sm dark:prose-invert max-w-none mb-6 lg:mb-10 text-slate-700 dark:text-slate-300 leading-relaxed border-l-2 border-brand-500/20 pl-4 py-1">
              <div dangerouslySetInnerHTML={{ __html: ticket.description }} />
            </div>

            {ticket.attachments && (
              <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                <TicketAttachments attachments={ticket.attachments as unknown as Attachment[]} />
              </div>
            )}
          </div>

          {/* TIMELINE DE ACTIVIDAD */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 px-2">
               <div className="h-1 w-6 bg-brand-500 rounded-full" />
               <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-500">
                 Historial de Gestión
               </h3>
            </div>

            <div className="space-y-4 border-l-2 border-slate-100 dark:border-slate-800 ml-3 lg:ml-4 pl-4 lg:pl-8">
              {ticket.history.map((entry) => (
                <div 
                  key={entry.id} 
                  className={`relative p-4 lg:p-6 rounded-xl lg:rounded-2xl border shadow-sm transition-all ${
                    entry.isInternal 
                    ? "bg-amber-50/40 border-amber-200 dark:bg-amber-900/10 dark:border-amber-900/30" 
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                  }`}
                >
                  <div className={`absolute -left-[21px] lg:-left-[41px] top-6 w-3 h-3 lg:w-4 lg:h-4 rounded-full border-2 lg:border-4 border-slate-50 dark:border-slate-950 ${entry.isInternal ? "bg-amber-400" : "bg-brand-500"}`} />

                  <div className="flex flex-col sm:flex-row justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center text-[9px] font-black">
                        {entry.user.name?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-black text-xs text-slate-900 dark:text-white leading-none">
                          {entry.user.name}
                        </p>
                        <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">
                          {entry.user.role}
                        </p>
                      </div>
                      {entry.isInternal && <span className="text-[8px] bg-amber-200 text-amber-800 px-1.5 py-0.5 rounded font-black uppercase">Privado</span>}
                    </div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase">{new Date(entry.createdAt).toLocaleString()}</span>
                  </div>

                  <div className="text-slate-700 dark:text-slate-300 text-xs lg:text-sm leading-relaxed prose-sm dark:prose-invert" dangerouslySetInnerHTML={{ __html: entry.comment || "" }} />
                  
                  {entry.attachments && (
                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                      <TicketAttachments attachments={entry.attachments as unknown as Attachment[]} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* PANEL DE GESTIÓN */}
          {ticket.status !== "CERRADO" && (
            <div className="p-1 lg:p-6 pt-1 lg:pt-8">
              <TicketManagementPanel 
                key={ticket.updatedAt.getTime()}
                ticket={ticket} 
                supportUsers={supportUsers}
                userRole={session.user.role || "CONTACTO_CLIENTE"}
              />
            </div>
          )}
        </div>

        {/* SIDEBAR DE METADATOS - Ahora más arriba en móvil */}
        <aside className="lg:col-span-4 space-y-2 lg:space-y-6 order-1 lg:order-3">
          <div className="card-module space-y-2 lg:space-y-8 bg-white dark:bg-slate-900 !p-4 lg:!p-6 lg:sticky lg:top-8">
            <section>
              <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Información del Cliente</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-brand-50 dark:bg-brand-500/10 rounded-lg text-brand-600 flex-shrink-0"><Building2 size={18}/></div>
                  <div className="min-w-0">
                    <p className="text-[9px] font-black text-slate-400 uppercase">Empresa</p>
                    <p className="text-xs lg:text-sm font-bold text-slate-800 dark:text-white truncate">{ticket.client.name}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-600 flex-shrink-0"><User size={18}/></div>
                  <div className="min-w-0">
                    <p className="text-[9px] font-black text-slate-400 uppercase">Solicitante</p>
                    <p className="text-xs lg:text-sm font-bold text-slate-800 dark:text-white truncate">{ticket.creator.name}</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="border-t border-slate-100 dark:border-slate-800 pt-2 lg:pt-6">
              <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Soporte Técnico</h4>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700 flex-shrink-0">
                  <User className="text-slate-400" size={18} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-black text-slate-800 dark:text-white truncate">
                    {ticket.assignedTo?.name || "Sin Asignar"}
                  </p>
                  <p className="text-[10px] text-slate-500 font-medium">
                    {ticket.assignedTo ? "Responsable Técnico" : "En espera"}
                  </p>
                </div>
              </div>
            </section>
          </div>
        </aside>

      </div>
    </div>
  );
}
// src/app/dashboard/tickets/[id]/page.tsx
import { auth } from "@/auth";
import db from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import TicketAttachments from "@/components/tickets/ticket-attachments";
import TicketManagementPanel from "@/components/tickets/ticket-management-panel";
import { Calendar, User, Building2, Tag, ShieldCheck, ArrowLeft, Clock, Activity } from "lucide-react";
import { getTicketMasters } from "@/lib/actions/masters";

interface Attachment {
  url: string;
  name: string;
}

export default async function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id || !session.user.providerId) {
    return <div className="p-10 text-center text-slate-500 font-bold">No autorizado</div>;
  }

  const { id } = await params;
  const role = session.user.role;
  const userId = session.user.id;

  // Consultas en paralelo incluyendo los permisos del usuario actual
  const [masters, ticket, dbUser] = await Promise.all([
    getTicketMasters(),
    db.ticket.findUnique({
      where: { id },
      include: {
        status: true,
        priority: true,
        category: true,
        attentionType: true,
        creator: true,
        createdBy: true,
        client: {
          include: { supportLevel: true } 
        },
        assignedTo: true,
        history: {
          include: { 
            user: true,
            status: true,
            priority: true,
            category: true
          },
          orderBy: { createdAt: "desc" }
        }
      },
    }),
    // Traemos las categorías permitidas si el usuario es del Staff
    (role !== "ADMIN" && role !== "SUPER_ADMIN" && role !== "CONTACTO_CLIENTE") 
      ? db.user.findUnique({
          where: { id: userId },
          select: { allowedCategories: { select: { id: true } } }
        })
      : Promise.resolve(null)
  ]);

  // 1. Candado Base: El ticket debe existir y pertenecer al proveedor actual
  if (!ticket || ticket.providerId !== session.user.providerId) notFound();

  // 2. Candado RBAC: Verificamos si el usuario tiene permiso para ver ESTE ticket
  if (role === "CONTACTO_CLIENTE") {
    if (ticket.clientId !== session.user.clientId) notFound();
  } else if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
    const allowedCategoryIds = dbUser?.allowedCategories.map(c => c.id) || [];
    const hasAccess = 
      ticket.creatorId === userId ||
      ticket.createdById === userId ||
      ticket.assignedToId === userId ||
      allowedCategoryIds.includes(ticket.categoryId);

    if (!hasAccess) notFound();
  }

  // Si pasamos los candados, buscamos a los usuarios para el panel de asignación
  const supportUsers = await db.user.findMany({
    where: {
      role: { in: ["ADMIN", "SOPORTE", "DESARROLLO", "VENTAS"] },
      providerId: session.user.providerId 
    },
    orderBy: { name: "asc" }
  });

  // ==========================================
  // CÁLCULO DINÁMICO DE TIEMPOS Y PERMISOS
  // ==========================================
  const isSupport = role && ["SUPER_ADMIN", "ADMIN", "SOPORTE", "DESARROLLO", "VENTAS"].includes(role);
  const sl = ticket.client.supportLevel;

  // Permisos de visibilidad
  const canViewAnalysis = isSupport || sl?.showTimeAnalysis;
  const canViewDev = isSupport || sl?.showTimeDev;
  const canViewSupport = isSupport || sl?.showTimeSupport;
  const canViewUpdate = isSupport || sl?.showTimeUpdate;

  // Sumas reales obtenidas del historial
  const rawAnalysis = ticket.history.reduce((acc, h) => acc + h.timeAnalysis, 0);
  const rawDev = ticket.history.reduce((acc, h) => acc + h.timeDev, 0);
  const rawSupport = ticket.history.reduce((acc, h) => acc + h.timeSupport, 0);
  const rawUpdate = ticket.history.reduce((acc, h) => acc + h.timeUpdate, 0);

  // Sumas filtradas (si el cliente no puede ver "Dev", su total no lo incluirá)
  const visibleAnalysis = canViewAnalysis ? rawAnalysis : 0;
  const visibleDev = canViewDev ? rawDev : 0;
  const visibleSupport = canViewSupport ? rawSupport : 0;
  const visibleUpdate = canViewUpdate ? rawUpdate : 0;
  
  const visibleGrandTotal = visibleAnalysis + visibleDev + visibleSupport + visibleUpdate;
  // ==========================================

  return (
    <div className="max-w-7xl mx-auto space-y-2 lg:space-y-6 py-2 lg:py-8 px-3 lg:px-8 transition-colors duration-300">
      
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-4 lg:pb-6">
        <Link href="/dashboard/tickets" className="group text-[11px] lg:text-sm font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:text-brand-600 flex items-center gap-2 transition-all">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Volver
        </Link>
        <div className="flex items-center gap-2 w-full lg:w-auto">
           <span 
             className="flex-1 lg:flex-none text-center px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm"
             style={{ 
               backgroundColor: `${ticket.status.color}15`,
               color: ticket.status.color,
               borderColor: `${ticket.status.color}40`
             }}
           >
            {ticket.status.name}
           </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-8">
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
                  <Tag size={12} className="text-brand-500"/> {ticket.category.name}
                </span>
                {ticket.attentionType && (
                  <span className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                    <Activity size={12} className="text-brand-500"/> {ticket.attentionType.name}
                  </span>
                )}
                <span 
                  className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded border-l-4"
                  style={{ borderLeftColor: ticket.priority.color }}
                >
                  <ShieldCheck size={12} className="text-brand-500"/> {ticket.priority.name}
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
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-[9px] text-slate-400 font-bold uppercase">
                            {entry.user.role}
                          </p>
                          {entry.status && (
                            <span 
                              className="text-[8px] font-black px-1.5 py-0.5 rounded uppercase"
                              style={{ backgroundColor: `${entry.status.color}20`, color: entry.status.color }}
                            >
                              {entry.status.name}
                            </span>
                          )}
                        </div>
                      </div>
                      {entry.isInternal && <span className="text-[8px] bg-amber-200 text-amber-800 px-1.5 py-0.5 rounded font-black uppercase">Privado</span>}
                    </div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase">{new Date(entry.createdAt).toLocaleString()}</span>
                  </div>

                  {(entry.timeAnalysis > 0 || entry.timeDev > 0 || entry.timeSupport > 0 || entry.timeUpdate > 0) && (
                    <div className="flex flex-wrap gap-2 mb-4 bg-slate-50 dark:bg-slate-950 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                      <span className="text-[9px] font-black uppercase tracking-widest text-brand-600 flex items-center mr-2">⏱️ Tiempos:</span>
                      {entry.timeAnalysis > 0 && canViewAnalysis && <span className="text-[9px] font-bold text-slate-500 bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">Análisis: {entry.timeAnalysis}m</span>}
                      {entry.timeDev > 0 && canViewDev && <span className="text-[9px] font-bold text-slate-500 bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">Desarrollo: {entry.timeDev}m</span>}
                      {entry.timeSupport > 0 && canViewSupport && <span className="text-[9px] font-bold text-slate-500 bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">Soporte: {entry.timeSupport}m</span>}
                      {entry.timeUpdate > 0 && canViewUpdate && <span className="text-[9px] font-bold text-slate-500 bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">Actualización: {entry.timeUpdate}m</span>}
                    </div>
                  )}

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

          {ticket.status.systemKey !== "CLOSED" && (
            <div className="p-1 lg:p-6 pt-1 lg:pt-8">
              <TicketManagementPanel 
                key={ticket.updatedAt.getTime()}
                ticket={ticket} 
                supportUsers={supportUsers}
                statuses={masters.statuses!}
                priorities={masters.priorities!}
                categories={masters.categories!}
                userRole={session.user.role!}
              />
            </div>
          )}
        </div>

        <aside className="lg:col-span-4 space-y-2 lg:space-y-6 order-1 lg:order-3">
          <div className="card-module space-y-2 lg:space-y-8 bg-white dark:bg-slate-900 !p-4 lg:!p-6 lg:sticky lg:top-8">
            
            {/* NUEVO BLOQUE: Resumen de Tiempos */}
            {visibleGrandTotal > 0 && (
              <section className="bg-brand-50/80 dark:bg-slate-800/80 border border-brand-100 dark:border-slate-700 p-4 rounded-xl mb-6 shadow-sm">
                <h4 className="text-[9px] font-black text-brand-600 dark:text-brand-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                  <Clock size={14} /> Resumen de Tiempos
                </h4>
                
                <div className="space-y-2.5">
                  {visibleAnalysis > 0 && (
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-600 dark:text-slate-300">Análisis</span>
                      <span className="font-black text-slate-800 dark:text-white">{visibleAnalysis} min</span>
                    </div>
                  )}
                  {visibleDev > 0 && (
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-600 dark:text-slate-300">Desarrollo</span>
                      <span className="font-black text-slate-800 dark:text-white">{visibleDev} min</span>
                    </div>
                  )}
                  {visibleSupport > 0 && (
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-600 dark:text-slate-300">Soporte/Gestión</span>
                      <span className="font-black text-slate-800 dark:text-white">{visibleSupport} min</span>
                    </div>
                  )}
                  {visibleUpdate > 0 && (
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-600 dark:text-slate-300">Actualización</span>
                      <span className="font-black text-slate-800 dark:text-white">{visibleUpdate} min</span>
                    </div>
                  )}
                  
                  <div className="pt-2.5 mt-1 border-t border-brand-200 dark:border-slate-700 flex justify-between items-center text-xs">
                    <span className="font-black uppercase tracking-widest text-brand-700 dark:text-brand-400">Total Invertido</span>
                    <span className="font-black text-brand-700 dark:text-brand-400 text-sm">{visibleGrandTotal} min</span>
                  </div>
                </div>
              </section>
            )}

            <section>
              <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Información del Cliente</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-brand-50 dark:bg-brand-500/10 rounded-lg text-brand-600 flex-shrink-0"><Building2 size={18}/></div>
                  <div className="min-w-0">
                    <p className="text-[9px] font-black text-slate-400 uppercase">Empresa</p>
                    <p className="text-xs lg:text-sm font-bold text-slate-800 dark:text-white truncate">{ticket.client.name}</p>
                    {ticket.client.supportLevel && (
                      <p className="text-[9px] font-bold text-brand-500 mt-1 uppercase tracking-widest">{ticket.client.supportLevel.name}</p>
                    )}
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
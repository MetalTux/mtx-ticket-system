// src/components/dashboard/ticket-status-board.tsx
import Link from "next/link";
import { TicketStatus } from "@prisma/client";
import { Building2, Tag } from "lucide-react";

interface FormattedTicket {
  id: string;
  folio: string;
  title: string;
  statusId: string;
  statusName: string;
  priority: string;
  priorityColor: string;
  prioritySystemKey?: string; // Asegúrate de incluirlo en el mapeo si tu esquema lo tiene, o se usará el nombre
  category: string;
  client: { name: string };
  updatedAt: Date; // Necesario para el ordenamiento por tiempo
}

interface TicketStatusBoardProps {
  tickets: FormattedTicket[];
  statuses: TicketStatus[];
}

export default function TicketStatusBoard({ tickets, statuses }: TicketStatusBoardProps) {
  // NUEVO FILTRO: Excluimos Resueltos, Cerrados y Cancelados del Dashboard inicial
  const EXCLUDED_KEYS = ["RESOLVED", "CLOSED", "CANCELLED"];
  const activeStatuses = statuses.filter(s => !EXCLUDED_KEYS.includes(s.systemKey || ""));

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory hide-scrollbar">
      {activeStatuses.map((status) => {
        // 1. Filtrar los tickets de esta columna
        const columnTickets = tickets.filter((t) => t.statusId === status.id);

        // 2. NUEVA LÓGICA DE ORDENAMIENTO: Urgentes primero, luego por fecha (más recientes arriba)
        const sortedTickets = [...columnTickets].sort((a, b) => {
          const isAUrgent = a.prioritySystemKey === "URGENT" || a.priority.toLowerCase() === "urgente";
          const isBUrgent = b.prioritySystemKey === "URGENT" || b.priority.toLowerCase() === "urgente";

          // Si uno es urgente y el otro no, el urgente va primero
          if (isAUrgent && !isBUrgent) return -1;
          if (!isAUrgent && isBUrgent) return 1;

          // Si ambos tienen la misma prioridad (ambos urgentes o ambos normales), ordena por fecha (el más nuevo arriba)
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        });

        return (
          <div 
            key={status.id} 
            className="flex-shrink-0 w-[320px] lg:w-[350px] flex flex-col bg-slate-50/50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 snap-center"
          >
            {/* Cabecera de la Columna */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white/50 dark:bg-slate-900/50 rounded-t-2xl">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: status.color }} 
                />
                <h3 className="font-black text-sm uppercase tracking-widest text-slate-700 dark:text-slate-200">
                  {status.name}
                </h3>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                {sortedTickets.length}
              </span>
            </div>

            {/* Lista de Tarjetas (Scrollable) */}
            <div className="flex-1 p-3 overflow-y-auto max-h-[600px] space-y-3 custom-scrollbar">
              {sortedTickets.length === 0 ? (
                <div className="h-24 flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Sin tickets</p>
                </div>
              ) : (
                sortedTickets.map((ticket) => {
                  const isUrgent = ticket.prioritySystemKey === "URGENT" || ticket.priority.toLowerCase() === "urgente";

                  return (
                    <Link 
                      key={ticket.id} 
                      href={`/dashboard/tickets/${ticket.id}`}
                      className={`block group p-4 rounded-xl border transition-all duration-300 bg-white dark:bg-slate-950 hover:shadow-lg hover:-translate-y-0.5 ${
                        isUrgent 
                          ? "border-red-200 dark:border-red-950/50 bg-gradient-to-br from-red-50/30 to-white dark:from-red-950/5 dark:to-slate-950 hover:border-red-500" 
                          : "border-slate-200 dark:border-slate-800 hover:border-brand-500"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-black text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded uppercase tracking-wider">
                            {ticket.folio}
                          </span>
                          {isUrgent && (
                            <span className="text-[9px] font-black text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-500/10 px-1.5 py-0.5 rounded uppercase tracking-wider animate-pulse">
                              Urgente
                            </span>
                          )}
                        </div>
                        <div 
                          className="w-2 h-2 rounded-full" 
                          style={{ backgroundColor: ticket.priorityColor }} 
                        />
                      </div>
                      
                      <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100 leading-snug mb-3 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors line-clamp-2">
                        {ticket.title}
                      </h4>
                      
                      <div className="space-y-2 mt-auto pt-3 border-t border-slate-100 dark:border-slate-800/50">
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate">
                          <Building2 size={12} className="flex-shrink-0" />
                          <span className="truncate">{ticket.client.name}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-brand-600 dark:text-brand-500 uppercase tracking-widest truncate">
                          <Tag size={12} className="flex-shrink-0 opacity-70" />
                          <span className="truncate">{ticket.category}</span>
                        </div>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
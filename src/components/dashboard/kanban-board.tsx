// src/components/dashboard/kanban-board.tsx
"use client";

import { useState } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { TicketStatus, Priority, Category, User } from "@prisma/client";
import { updateTicketStatusQuick } from "@/lib/actions/tickets";
import { STATUS_LABELS, PRIORITY_LABELS, CATEGORY_LABELS } from "@/enums/constantes";
import { toast } from "sonner";
import Link from "next/link";
import { Building2, Clock, Tag } from "lucide-react";
import EscalationModal from "@/components/dashboard/escalation-modal";

const COLUMNS: TicketStatus[] = ["PENDIENTE", "EN_PROCESO", "ESCALADO", "RESUELTO"];

interface KanbanTicket {
  id: string;
  folio: string;
  title: string;
  status: TicketStatus;
  priority: Priority;
  category: Category;
  createdAt: Date | string;
  client: { name: string };
}

type SimpleUser = {
  id: string;
  name: string | null;
};

interface KanbanBoardProps {
  initialTickets: KanbanTicket[];
  supportUsers: SimpleUser[]; // Debes pasar los técnicos desde el server component
}

export default function KanbanBoard({ initialTickets, supportUsers }: KanbanBoardProps) {
  const [tickets, setTickets] = useState(initialTickets);
  
  // Estado para controlar el modal de escalado
  const [escalationData, setEscalationData] = useState<{
    ticketId: string;
    isOpen: boolean;
  }>({ ticketId: "", isOpen: false });

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId) return;

    const newStatus = destination.droppableId as TicketStatus;

    // INTERCEPCIÓN: Si el destino es ESCALADO, abrimos el modal
    if (newStatus === "ESCALADO") {
      setEscalationData({ ticketId: draggableId, isOpen: true });
      return;
    }

    // Lógica normal para otros estados
    await handleStatusUpdate(draggableId, newStatus);
  };

  const handleStatusUpdate = async (ticketId: string, newStatus: TicketStatus, assignedToId?: string) => {
    // Actualización Optimista
    const previousTickets = [...tickets];
    const updatedTickets = tickets.map((t) =>
      t.id === ticketId ? { ...t, status: newStatus } : t
    );
    setTickets(updatedTickets);

    const response = await updateTicketStatusQuick(ticketId, newStatus, assignedToId);

    if (response.success) {
      toast.success(`Ticket movido a ${STATUS_LABELS[newStatus]}`);
    } else {
      toast.error("Error al actualizar el estado");
      setTickets(previousTickets);
    }
  };

  const handleEscalationConfirm = async (userId: string) => {
    const tId = escalationData.ticketId;
    setEscalationData({ ticketId: "", isOpen: false });
    await handleStatusUpdate(tId, "ESCALADO", userId);
  };

  const getPriorityStyles = (priority: Priority) => {
    switch (priority) {
      case "URGENTE": 
        return "bg-red-100 text-red-700 border-red-200 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30";
      case "ALTA": 
        return "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-500/20 dark:text-orange-400 dark:border-orange-500/30";
      case "MEDIA": 
        return "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30";
      case "BAJA": 
        return "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30";
      default: 
        return "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700";
    }
  };

  return (
    <>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-6 overflow-x-auto pb-8 min-h-[75vh] scrollbar-hide transition-colors duration-300">
          {COLUMNS.map((columnId) => (
            <div key={columnId} className="flex-1 min-w-[300px] flex flex-col">
              <h3 className="font-black text-[11px] uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500 mb-4 px-2 flex justify-between items-center">
                {STATUS_LABELS[columnId]}
                <span className="bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-md text-[10px] font-bold shadow-sm">
                  {tickets.filter(t => t.status === columnId).length}
                </span>
              </h3>

              <Droppable droppableId={columnId}>
                {(provided, snapshot) => (
                  <div 
                    {...provided.droppableProps} 
                    ref={provided.innerRef} 
                    className={`flex-1 space-y-4 rounded-2xl p-2 transition-colors duration-300 min-h-[500px] border border-transparent ${
                      snapshot.isDraggingOver 
                        ? 'bg-slate-200/50 dark:bg-slate-800/40 border-slate-300 dark:border-slate-700' 
                        : 'bg-slate-100/40 dark:bg-slate-900/40'
                    }`}
                  >
                    {tickets
                      .filter((t) => t.status === columnId)
                      .map((ticket, index) => (
                        <Draggable key={ticket.id} draggableId={ticket.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`group p-4 rounded-xl bg-white dark:bg-slate-800 border transition-all duration-200 ${
                                snapshot.isDragging 
                                  ? 'rotate-2 shadow-2xl border-brand-500 dark:border-brand-400 scale-105 z-50 ring-4 ring-brand-500/10' 
                                  : 'border-slate-200 dark:border-slate-700/50 shadow-sm hover:border-brand-300 dark:hover:border-slate-600'
                              }`}
                            >
                              <Link href={`/dashboard/tickets/${ticket.id}`} className="space-y-3 block">
                                <div className="flex justify-between items-start gap-2">
                                  <span className="text-[10px] font-black bg-slate-900 text-white dark:bg-slate-700 px-2 py-0.5 rounded shadow-sm tracking-tight uppercase">
                                    {ticket.folio}
                                  </span>
                                  <span className={`text-[9px] font-black px-2 py-0.5 rounded-md border tracking-wide uppercase shadow-sm ${getPriorityStyles(ticket.priority)}`}>
                                    {PRIORITY_LABELS[ticket.priority]}
                                  </span>
                                </div>

                                <p className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-snug group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                                  {ticket.title}
                                </p>

                                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700/50 gap-2">
                                  <div className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400 min-w-0 flex-1">
                                    <Building2 size={12} className="shrink-0 text-slate-400" />
                                    <span className="truncate font-medium">{ticket.client.name}</span>
                                  </div>
                                  <div className="flex items-center gap-1 text-[9px] font-black text-brand-700 dark:text-brand-300 bg-brand-50 dark:bg-brand-500/10 px-2 py-0.5 rounded border border-brand-100 dark:border-brand-500/20 shrink-0 uppercase shadow-sm">
                                    <Tag size={10} />
                                    <span>{CATEGORY_LABELS[ticket.category]}</span>
                                  </div>
                                </div>
                              </Link>
                            </div>
                          )}
                        </Draggable>
                      ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

      {/* Modal de Escalado */}
      <EscalationModal 
        isOpen={escalationData.isOpen}
        onClose={() => setEscalationData({ ticketId: "", isOpen: false })}
        onConfirm={handleEscalationConfirm}
        supportUsers={supportUsers}
      />
    </>
  );
}

// // src/components/dashboard/kanban-board.tsx
// "use client";

// import { useState } from "react";
// import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
// import { TicketStatus, Priority, Category } from "@prisma/client";
// import { updateTicketStatusQuick } from "@/lib/actions/tickets";
// import { STATUS_LABELS, PRIORITY_LABELS, CATEGORY_LABELS } from "@/enums/constantes";
// import { toast } from "sonner";
// import Link from "next/link";
// import { Building2, Clock, Tag } from "lucide-react";

// const COLUMNS: TicketStatus[] = ["PENDIENTE", "EN_PROCESO", "ESCALADO", "RESUELTO"];

// interface KanbanTicket {
//   id: string;
//   folio: string;
//   title: string;
//   status: TicketStatus;
//   priority: Priority;
//   category: Category;
//   createdAt: Date | string;
//   client: { name: string };
// }

// export default function KanbanBoard({ initialTickets }: { initialTickets: KanbanTicket[] }) {
//   const [tickets, setTickets] = useState(initialTickets);

//   const onDragEnd = async (result: DropResult) => {
//     const { destination, source, draggableId } = result;

//     if (!destination) return;
//     if (destination.droppableId === source.droppableId) return;

//     const newStatus = destination.droppableId as TicketStatus;

//     const updatedTickets = tickets.map((t) =>
//       t.id === draggableId ? { ...t, status: newStatus } : t
//     );
//     setTickets(updatedTickets);

//     const response = await updateTicketStatusQuick(draggableId, newStatus);

//     if (response.success) {
//       toast.success(`Ticket movido a ${STATUS_LABELS[newStatus]}`);
//     } else {
//       toast.error("Error al actualizar el estado");
//       setTickets(initialTickets);
//     }
//   };

//   const getPriorityStyles = (priority: Priority) => {
//     switch (priority) {
//       case "URGENTE": 
//         return "bg-red-100 text-red-700 border-red-200 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30";
//       case "ALTA": 
//         return "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-500/20 dark:text-orange-400 dark:border-orange-500/30";
//       case "MEDIA": 
//         return "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30";
//       case "BAJA": 
//         return "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30";
//       default: 
//         return "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700";
//     }
//   };

//   return (
//     <DragDropContext onDragEnd={onDragEnd}>
//       <div className="flex gap-6 overflow-x-auto pb-8 min-h-[75vh] scrollbar-hide">
//         {COLUMNS.map((columnId) => (
//           <div key={columnId} className="flex-1 min-w-[300px] flex flex-col">
//             <h3 className="font-black text-[11px] uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500 mb-4 px-2 flex justify-between items-center">
//               {STATUS_LABELS[columnId]}
//               <span className="bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-md text-[10px] font-bold">
//                 {tickets.filter(t => t.status === columnId).length}
//               </span>
//             </h3>

//             <Droppable droppableId={columnId}>
//               {(provided, snapshot) => (
//                 <div 
//                   {...provided.droppableProps} 
//                   ref={provided.innerRef} 
//                   className={`flex-1 space-y-4 rounded-2xl p-2 transition-colors duration-300 min-h-[500px] ${
//                     snapshot.isDraggingOver ? 'bg-slate-200/50 dark:bg-slate-800/40' : 'bg-slate-100/40 dark:bg-slate-900/40'
//                   }`}
//                 >
//                   {tickets
//                     .filter((t) => t.status === columnId)
//                     .map((ticket, index) => (
//                       <Draggable key={ticket.id} draggableId={ticket.id} index={index}>
//                         {(provided, snapshot) => (
//                           <div
//                             ref={provided.innerRef}
//                             {...provided.draggableProps}
//                             {...provided.dragHandleProps}
//                             className={`group p-4 rounded-xl bg-white dark:bg-slate-800 border transition-all duration-200 ${
//                               snapshot.isDragging 
//                                 ? 'rotate-2 shadow-2xl border-brand-500 dark:border-brand-400 scale-105 z-50' 
//                                 : 'border-slate-200 dark:border-slate-700/50 shadow-sm hover:border-brand-300 dark:hover:border-slate-600'
//                             }`}
//                           >
//                             <Link href={`/dashboard/tickets/${ticket.id}`} className="space-y-3 block">
//                               <div className="flex justify-between items-start gap-2">
//                                 <span className="text-[10px] font-black bg-slate-900 text-white dark:bg-slate-700 px-2 py-0.5 rounded shadow-sm tracking-tight uppercase">
//                                   {ticket.folio}
//                                 </span>
//                                 <span className={`text-[9px] font-black px-2 py-0.5 rounded-md border tracking-wide uppercase ${getPriorityStyles(ticket.priority)}`}>
//                                   {PRIORITY_LABELS[ticket.priority]}
//                                 </span>
//                               </div>

//                               <p className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-snug group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
//                                 {ticket.title}
//                               </p>

//                               <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700/50 gap-2">
//                                 <div className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400 min-w-0 flex-1">
//                                   <Building2 size={12} className="shrink-0 text-slate-400" />
//                                   <span className="truncate font-medium">{ticket.client.name}</span>
//                                 </div>
//                                 <div className="flex items-center gap-1 text-[9px] font-black text-brand-700 dark:text-brand-300 bg-brand-50 dark:bg-brand-500/10 px-2 py-0.5 rounded border border-brand-100 dark:border-brand-500/20 shrink-0 uppercase">
//                                   <Tag size={10} />
//                                   <span>{CATEGORY_LABELS[ticket.category]}</span>
//                                 </div>
//                               </div>
//                             </Link>
//                           </div>
//                         )}
//                       </Draggable>
//                     ))}
//                   {provided.placeholder}
//                 </div>
//               )}
//             </Droppable>
//           </div>
//         ))}
//       </div>
//     </DragDropContext>
//   );
// }
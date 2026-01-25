// src/components/dashboard/kanban-board.tsx
"use client";

import { useState } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { TicketStatus, Priority, Category } from "@prisma/client";
import { updateTicketStatusQuick } from "@/lib/actions/tickets";
import { STATUS_LABELS, PRIORITY_LABELS, CATEGORY_LABELS } from "@/enums/constantes";
import { toast } from "sonner";
import Link from "next/link";
import { Building2, AlertCircle, Clock, Tag } from "lucide-react";

// Definimos las columnas que queremos mostrar
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

export default function KanbanBoard({ initialTickets }: { initialTickets: KanbanTicket[] }) {
  const [tickets, setTickets] = useState(initialTickets);

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return; // Soltado fuera de una lista
    if (destination.droppableId === source.droppableId) return; // Soltado en la misma lista

    const newStatus = destination.droppableId as TicketStatus;

    // 1. Actualización Optimista (cambiamos la UI antes que la DB)
    const updatedTickets = tickets.map((t) =>
      t.id === draggableId ? { ...t, status: newStatus } : t
    );
    setTickets(updatedTickets);

    // 2. Llamada al Servidor
    const response = await updateTicketStatusQuick(draggableId, newStatus);

    if (response.success) {
      toast.success(`Ticket movido a ${newStatus.replace("_", " ")}`);
    } else {
      toast.error("Error al actualizar el estado");
      setTickets(initialTickets); // Revertimos si falla
    }
  };

  const getPriorityStyles = (priority: Priority) => {
    switch (priority) {
      case "URGENTE": 
        return "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800";
      case "ALTA": 
        return "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800";
      case "MEDIA": 
        return "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800";
      case "BAJA": 
        return "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800";
      default: 
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-6 overflow-x-auto pb-6 min-h-[70vh]">
        {COLUMNS.map((columnId) => (
          <div key={columnId} className="flex-1 min-w-[280px] bg-slate-100/50 dark:bg-slate-900/50 rounded-2xl p-4 border border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-sm uppercase tracking-widest text-slate-500 mb-4 px-2 flex justify-between items-center">
              {STATUS_LABELS[columnId]}
              <span className="bg-slate-200 dark:bg-slate-800 text-slate-600 px-2 py-0.5 rounded-full text-[10px]">
                {tickets.filter(t => t.status === columnId).length}
              </span>
            </h3>

            <Droppable droppableId={columnId}>
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3 min-h-[500px]">
                  {tickets
                    .filter((t) => t.status === columnId)
                    .map((ticket, index) => (
                      <Draggable key={ticket.id} draggableId={ticket.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`p-3 rounded-xl bg-white dark:bg-slate-800 border shadow-sm hover:shadow-md transition-all ${
                              snapshot.isDragging ? 'rotate-2 shadow-xl border-brand-500 z-50' : 'border-slate-200 dark:border-slate-700'
                            }`}
                          >
                            <Link href={`/dashboard/tickets/${ticket.id}`} className="space-y-2 block">
                              {/* Fila Superior: ID y Prioridad */}
                              <div className="flex justify-between items-center mb-1">
                                <div className="flex items-center gap-2">
                                  {/* Folio con estilo de placa metálica/profesional */}
                                  <span className="text-[11px] font-black bg-slate-900 text-white dark:bg-slate-700 px-2 py-0.5 rounded shadow-sm tracking-tighter">
                                    {ticket.folio}
                                  </span>
                                  
                                  {/* Fecha sutil con icono de reloj */}
                                  <div className="flex items-center gap-1 text-slate-400">
                                    <Clock size={10} />
                                    <span className="text-[9px] font-medium">
                                      {new Date(ticket.createdAt).toLocaleDateString('es-ES', { 
                                        day: '2-digit', 
                                        month: 'short' 
                                      })}
                                    </span>
                                  </div>
                                </div>

                                {/* Badge de Prioridad (Pequeño) */}
                                <span className={`text-[9px] font-black px-2 py-0.5 rounded-md border shadow-sm shrink-0 ${getPriorityStyles(ticket.priority)}`}>
                                  {PRIORITY_LABELS[ticket.priority]}
                                </span>
                              </div>

                              {/* Título */}
                              <p className="text-sm font-bold text-slate-800 dark:text-white leading-tight line-clamp-2">
                                {ticket.title}
                              </p>

                              {/* Footer de la tarjeta: Cliente y Categoría */}
                              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700/50 mt-2 gap-2">
                                {/* Contenedor Cliente: con flex-1 y truncate para que no empuje al otro */}
                                <div className="flex items-center gap-1.5 text-[10px] text-slate-500 min-w-0 flex-1">
                                  <Building2 size={10} className="shrink-0" />
                                  <span className="truncate">{ticket.client.name}</span>
                                </div>
                                
                                {/* Contenedor Categoría: con shrink-0 para que NUNCA se oculte */}
                                <div className="flex items-center gap-1 text-[9px] font-bold text-brand-700 dark:text-brand-300 bg-brand-50 dark:bg-brand-900/30 px-1.5 py-0.5 rounded shrink-0 whitespace-nowrap">
                                  <Tag size={10} className="shrink-0" />
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
  );
}
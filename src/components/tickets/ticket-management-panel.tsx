// src/components/tickets/ticket-management-panel.tsx
"use client";

import { useState } from "react";
import { Priority, Category, TicketStatus, User, Ticket } from "@prisma/client";
import RichEditor from "@/components/ui/rich-editor";
import { updateTicketFull } from "@/lib/actions/tickets";

interface TicketManagementProps {
  ticket: Ticket;
  supportUsers: User[];
  userRole: string;
}

export default function TicketManagementPanel({ 
  ticket, 
  supportUsers,
  userRole 
}: TicketManagementProps) {
  const [content, setContent] = useState("");
  
  // Verificamos si es personal del proveedor (Soporte, Admin, etc.)
  const isSupport = userRole !== "CONTACTO_CLIENTE";

  return (
    <div className="card-module border-t-4 border-t-brand-600 bg-slate-50/50 dark:bg-slate-900/20">
      <h3 className="font-bold text-lg mb-4">
        {isSupport ? "Gestión y Respuesta" : "Agregar información adicional"}
      </h3>
      
      <form action={updateTicketFull} className="space-y-4">
        <input type="hidden" name="ticketId" value={ticket.id} />
        <input type="hidden" name="comment" value={content} />
        
        {/* Si NO es soporte, enviamos los valores actuales de forma oculta */}
        {!isSupport && (
          <>
            <input type="hidden" name="assignedToId" value={ticket.assignedToId || ""} />
            <input type="hidden" name="priority" value={ticket.priority} />
            <input type="hidden" name="category" value={ticket.category} />
            <input type="hidden" name="status" value={ticket.status} />
          </>
        )}

        {/* Solo mostramos estos controles al personal de Soporte/Admin */}
        {isSupport && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in duration-500">
            {/* ASIGNACIÓN */}
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-500">Asignar a</label>
              <select name="assignedToId" defaultValue={ticket.assignedToId || ""} className="form-input text-sm">
                <option value="">Sin asignar</option>
                {supportUsers.map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>

            {/* PRIORIDAD */}
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-500">Prioridad</label>
              <select name="priority" defaultValue={ticket.priority} className="form-input text-sm">
                {Object.values(Priority).map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            {/* CATEGORÍA */}
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-500">Categoría</label>
              <select name="category" defaultValue={ticket.category} className="form-input text-sm">
                {Object.values(Category).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* ESTADO */}
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-500">Estado</label>
              <select name="status" defaultValue={ticket.status} className="form-input text-sm">
                {Object.values(TicketStatus).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        )}

        <div className="mt-4">
          <label className="text-[10px] font-bold uppercase text-slate-500">
            {isSupport ? "Comentario Técnico / Respuesta" : "Escriba su consulta o información adicional"}
          </label>
          <RichEditor content={content} onChange={setContent} />
        </div>

        <div className="flex justify-between items-center pt-2">
          {isSupport ? (
            <label className="flex items-center gap-2 text-xs text-slate-500 cursor-pointer">
              <input type="checkbox" name="isInternal" value="true" className="rounded shadow-sm" />
              ¿Es una nota interna? (Oculta para el cliente)
            </label>
          ) : (
            <div /> // Espacio vacío si es cliente
          )}
          
          <button type="submit" className="btn-primary" disabled={!content || content === "<p></p>"}>
            {isSupport ? "Actualizar Ticket" : "Enviar información"}
          </button>
        </div>
      </form>
    </div>
  );
}
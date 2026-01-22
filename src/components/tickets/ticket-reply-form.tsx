// src/components/tickets/ticket-reply-form.tsx
"use client";

import { useState } from "react";
import RichEditor from "@/components/ui/rich-editor";
import { UploadButton } from "@/lib/uploadthing"; // El helper que creamos antes
import { addTicketUpdate } from "@/lib/actions/tickets";
import { TicketStatus } from "@prisma/client";
import { X, Paperclip } from "lucide-react";

export default function TicketReplyForm({ 
  ticketId, 
  currentStatus, 
  userRole 
}: { 
  ticketId: string, 
  currentStatus: TicketStatus,
  userRole: string 
}) {
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<TicketStatus>(currentStatus);
  const [isInternal, setIsInternal] = useState(false);
  const [files, setFiles] = useState<{ url: string; name: string }[]>([]);

  return (
    <form action={addTicketUpdate} className="space-y-4">
      {/* Inputs Ocultos para el Server Action */}
      <input type="hidden" name="ticketId" value={ticketId} />
      <input type="hidden" name="comment" value={content} />
      <input type="hidden" name="isInternal" value={String(isInternal)} />
      <input type="hidden" name="attachments" value={JSON.stringify(files)} />

      <RichEditor content={content} onChange={setContent} />

      {/* Visualización de archivos seleccionados para la respuesta */}
      {files.length > 0 && (
        <div className="flex flex-wrap gap-2 p-2 bg-slate-50 dark:bg-slate-900/50 rounded-md border border-dashed border-slate-300">
          {files.map((file, idx) => (
            <div key={idx} className="flex items-center gap-2 bg-white dark:bg-slate-800 px-2 py-1 rounded border text-xs">
              <span className="truncate max-w-[150px]">{file.name}</span>
              <button 
                type="button" 
                onClick={() => setFiles(prev => prev.filter((_, i) => i !== idx))}
                className="text-red-500 hover:text-red-700"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4 border-t pt-4">
        <div className="flex items-center gap-4">
          {/* Botón de Subida Adaptado */}
          <UploadButton
            endpoint="ticketAttachment"
            onClientUploadComplete={(res) => {
              if (res) {
                const uploaded = res.map(f => ({ url: f.url, name: f.name }));
                setFiles(prev => [...prev, ...uploaded]);
              }
            }}
            appearance={{
              button: "ut-ready:bg-slate-200 dark:ut-ready:bg-slate-700 ut-ready:text-slate-700 dark:ut-ready:text-slate-200 text-xs h-9 px-3 w-auto",
              allowedContent: "hidden" // Ocultamos el texto de ayuda para ahorrar espacio
            }}
            content={{
              button({ ready }) {
                return (
                  <div className="flex items-center gap-2">
                    <Paperclip className="w-3 h-3" />
                    {ready ? "Adjuntar" : "..."}
                  </div>
                );
              }
            }}
          />

          {userRole !== "CONTACTO_CLIENTE" && (
            <select 
              name="status" 
              value={status} 
              onChange={(e) => setStatus(e.target.value as TicketStatus)}
              className="form-input text-xs h-9 w-32"
            >
              <option value="PENDIENTE">Pendiente</option>
              <option value="EN_PROCESO">En Proceso</option>
              <option value="RESUELTO">Resuelto</option>
              <option value="CERRADO">Cerrar</option>
            </select>
          )}
          
          {userRole === "CONTACTO_CLIENTE" && (
            <input type="hidden" name="status" value={currentStatus} />
          )}
        </div>

        <button 
          type="submit" 
          disabled={!content || content === "<p></p>"}
          className="btn-primary py-2 px-6 text-sm"
        >
          Enviar {userRole === "CONTACTO_CLIENTE" ? "Información" : "Respuesta"}
        </button>
      </div>

      {userRole !== "CONTACTO_CLIENTE" && (
        <label className="flex items-center gap-2 text-[10px] text-slate-500 cursor-pointer uppercase font-bold tracking-wider">
          <input 
            type="checkbox" 
            checked={isInternal} 
            onChange={(e) => setIsInternal(e.target.checked)}
            className="rounded border-gray-300"
          />
          Visible solo para soporte interno
        </label>
      )}
    </form>
  );
}
// src/components/tickets/ticket-reply-form.tsx
"use client";

import { useState } from "react";
import dynamic from 'next/dynamic';
import { UploadButton } from "@/lib/uploadthing";
import { addTicketUpdate } from "@/lib/actions/tickets";
import { TicketStatus } from "@prisma/client";
import { X, Paperclip } from "lucide-react";
import LoadingButton from "@/components/ui/loading-button";

const RichEditor = dynamic(() => import('@/components/ui/rich-editor'), { 
  ssr: false,
  loading: () => <div className="h-[150px] w-full bg-slate-100 dark:bg-slate-800 animate-pulse rounded-lg" />
});

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
    <form action={addTicketUpdate} className="space-y-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm transition-colors">
      <input type="hidden" name="ticketId" value={ticketId} />
      <input type="hidden" name="comment" value={content} />
      <input type="hidden" name="isInternal" value={String(isInternal)} />
      <input type="hidden" name="attachments" value={JSON.stringify(files)} />

      <RichEditor content={content} onChange={setContent} />

      {files.length > 0 && (
        <div className="flex flex-wrap gap-2 p-2 bg-slate-50 dark:bg-slate-800 rounded-md border border-dashed border-slate-300 dark:border-slate-700">
          {files.map((file, idx) => (
            <div key={idx} className="flex items-center gap-2 bg-white dark:bg-slate-900 px-2 py-1 rounded border dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300">
              <span className="truncate max-w-[150px]">{file.name}</span>
              <button type="button" onClick={() => setFiles(prev => prev.filter((_, i) => i !== idx))} className="text-red-500 hover:text-red-700">
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 dark:border-slate-800 pt-4">
        <div className="flex items-center gap-3">
          <UploadButton
            endpoint="ticketAttachment"
            onClientUploadComplete={(res) => {
              if (res) {
                const uploaded = res.map(f => ({ url: f.url, name: f.name }));
                setFiles(prev => [...prev, ...uploaded]);
              }
            }}
            appearance={{
              button: "ut-ready:bg-slate-100 dark:ut-ready:bg-slate-800 ut-ready:text-slate-700 dark:ut-ready:text-slate-200 text-xs h-9 px-3 w-auto border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer",
              allowedContent: "hidden"
            }}
            content={{
              button({ ready }) {
                return (
                  <div className="flex items-center gap-2">
                    <Paperclip size={14} />
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
              className="form-input text-xs h-9 w-36 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
            >
              <option value="PENDIENTE">Pendiente</option>
              <option value="EN_PROCESO">En Proceso</option>
              <option value="RESUELTO">Resuelto</option>
              <option value="CERRADO">Cerrado</option>
            </select>
          )}
          
          {userRole === "CONTACTO_CLIENTE" && (
            <input type="hidden" name="status" value={currentStatus} />
          )}
        </div>

        <LoadingButton 
          type="submit" 
          loadingText="Enviando..."
          disabled={!content || content === "<p></p>"}
          className="py-2 px-8 text-sm font-bold uppercase tracking-wider"
        >
          Enviar {userRole === "CONTACTO_CLIENTE" ? "Información" : "Respuesta"}
        </LoadingButton>
      </div>

      {userRole !== "CONTACTO_CLIENTE" && (
        <label className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400 cursor-pointer uppercase font-bold tracking-widest">
          <input 
            type="checkbox" 
            checked={isInternal} 
            onChange={(e) => setIsInternal(e.target.checked)}
            className="rounded dark:bg-slate-800 dark:border-slate-700"
          />
          Nota interna (Oculta para el cliente)
        </label>
      )}
    </form>
  );
}
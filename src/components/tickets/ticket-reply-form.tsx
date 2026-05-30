// src/components/tickets/ticket-reply-form.tsx
"use client";

import { useState, useEffect, useTransition, startTransition, useActionState, useRef } from "react";
import dynamic from 'next/dynamic';
import { UploadButton } from "@/lib/uploadthing";
import { addTicketUpdate, type UpdateTicketState } from "@/lib/actions/tickets";
import { TicketStatus } from "@prisma/client";
import { X, Paperclip, AlertCircle, Clock } from "lucide-react";
import LoadingButton from "@/components/ui/loading-button";

const RichEditor = dynamic(() => import('@/components/ui/rich-editor'), { 
  ssr: false,
  loading: () => <div className="h-[150px] w-full bg-slate-100 dark:bg-slate-800 animate-pulse rounded-lg" />
});

interface TicketReplyFormProps {
  ticketId: string;
  currentStatusId: string;
  statuses: TicketStatus[]; 
  userRole: string;
  supportLevel?: {
    showTimeAnalysis: boolean;
    showTimeDev: boolean;
    showTimeSupport: boolean;
    showTimeUpdate: boolean;
  } | null;
}

export default function TicketReplyForm({ 
  ticketId, 
  currentStatusId, 
  statuses,
  userRole,
  supportLevel
}: TicketReplyFormProps) {
  const [content, setContent] = useState("");
  const [files, setFiles] = useState<{ url: string; name: string }[]>([]);
  const formRef = useRef<HTMLFormElement>(null);
  
  const [state, formAction, isPending] = useActionState<UpdateTicketState, FormData>(
    addTicketUpdate, 
    null
  );

  const isSupport = ["ADMIN", "SOPORTE", "DESARROLLO"].includes(userRole);

  useEffect(() => {
    if (state?.success) {
      startTransition(() => {
        setContent("");
        setFiles([]);
      });
      formRef.current?.reset();
    }
  }, [state?.success]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm transition-colors">
      <input type="hidden" name="ticketId" value={ticketId} />
      <input type="hidden" name="comment" value={content} />
      <input type="hidden" name="attachments" value={JSON.stringify(files)} />

      {state?.message && !state.success && (
        <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-lg text-xs font-bold border border-red-100">
          <AlertCircle size={14} />
          {state.message}
        </div>
      )}

      {/* PANEL DE CAPTURA DE TIEMPOS CONDICIONAL */}
      {isSupport && supportLevel && (supportLevel.showTimeAnalysis || supportLevel.showTimeDev || supportLevel.showTimeSupport || supportLevel.showTimeUpdate) && (
        <div className="bg-brand-50/50 dark:bg-slate-800/30 border border-brand-100 dark:border-slate-700 p-3 rounded-lg space-y-2 mb-2">
          <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400">
            <Clock size={14} />
            <h4 className="text-[10px] font-black uppercase tracking-widest">Tiempos de Gestión (Minutos)</h4>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {supportLevel.showTimeAnalysis && (
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-500">Análisis</label>
                <input type="number" name="timeAnalysis" min="0" defaultValue="0" className="form-input py-1 text-xs bg-white dark:bg-slate-900" />
              </div>
            )}
            {supportLevel.showTimeDev && (
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-500">Desarrollo</label>
                <input type="number" name="timeDev" min="0" defaultValue="0" className="form-input py-1 text-xs bg-white dark:bg-slate-900" />
              </div>
            )}
            {supportLevel.showTimeSupport && (
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-500">Soporte</label>
                <input type="number" name="timeSupport" min="0" defaultValue="0" className="form-input py-1 text-xs bg-white dark:bg-slate-900" />
              </div>
            )}
            {supportLevel.showTimeUpdate && (
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-500">Actualizaciones</label>
                <input type="number" name="timeUpdate" min="0" defaultValue="0" className="form-input py-1 text-xs bg-white dark:bg-slate-900" />
              </div>
            )}
          </div>
        </div>
      )}

      <RichEditor content={content} onChange={setContent} />

      {files.length > 0 && (
        <div className="flex flex-wrap gap-2 p-2 bg-slate-50 dark:bg-slate-800 rounded-md border border-dashed border-slate-300 dark:border-slate-700">
          {files.map((file, idx) => (
            <div key={idx} className="flex items-center gap-2 bg-white dark:bg-slate-900 px-2 py-1 rounded border dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300">
              <span className="truncate max-w-[150px] font-medium">{file.name}</span>
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
                  <div className="flex items-center gap-2 font-bold uppercase tracking-tighter">
                    <Paperclip size={14} />
                    {ready ? "Adjuntar" : "..."}
                  </div>
                );
              }
            }}
          />

          {isSupport ? (
            <select 
              name="statusId" 
              defaultValue={currentStatusId} 
              className="form-input text-xs h-9 w-40 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 font-bold"
            >
              {statuses.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          ) : (
            <input type="hidden" name="statusId" value={currentStatusId} />
          )}
        </div>

        <LoadingButton 
          type="submit" 
          isLoading={isPending}
          loadingText="Enviando..."
          disabled={(!content || content === "<p></p>") && files.length === 0}
          className="py-2 px-8 text-sm font-black uppercase tracking-widest shadow-lg shadow-brand-500/10"
        >
          Enviar {isSupport ? "Respuesta" : "Información"}
        </LoadingButton>
      </div>

      {isSupport && (
        <label className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400 cursor-pointer uppercase font-black tracking-[0.2em] mt-2">
          <input 
            type="checkbox" 
            name="isInternal" 
            value="true"
            className="rounded dark:bg-slate-800 dark:border-slate-700 text-brand-600 focus:ring-brand-500"
          />
          Nota interna (Privada para el equipo)
        </label>
      )}
    </form>
  );
}
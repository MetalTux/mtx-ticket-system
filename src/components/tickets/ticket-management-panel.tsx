// src/components/tickets/ticket-management-panel.tsx
"use client";

import { useState, useRef, useTransition, useEffect, useActionState } from "react";
import { 
  User, 
  Ticket, 
  TicketStatus, 
  TicketPriority, 
  TicketCategory,
  ClientCompany,
  SupportLevel
} from "@prisma/client";
import dynamic from 'next/dynamic';
import { updateTicketFull, type UpdateTicketState } from "@/lib/actions/tickets";
import { UploadButton } from "@/lib/uploadthing";
import { X, Paperclip, Mail, Settings2, AlertCircle, Clock } from "lucide-react";
import LoadingButton from "@/components/ui/loading-button";

const RichEditor = dynamic(() => import('@/components/ui/rich-editor'), { 
  ssr: false,
  loading: () => <div className="h-[200px] w-full bg-slate-100 dark:bg-slate-800 animate-pulse rounded-lg border border-slate-200 dark:border-slate-700" />
});

// Tipo extendido incluyendo el Client y el SupportLevel
type TicketWithMasters = Ticket & {
  status: TicketStatus;
  priority: TicketPriority;
  category: TicketCategory;
  client: ClientCompany & {
    supportLevel: SupportLevel | null;
  };
};

interface TicketManagementProps {
  ticket: TicketWithMasters;
  supportUsers: User[];
  statuses: TicketStatus[];     
  priorities: TicketPriority[]; 
  categories: TicketCategory[]; 
  userRole: string;
}

export default function TicketManagementPanel({ 
  ticket, 
  supportUsers,
  statuses,
  priorities,
  categories,
  userRole 
}: TicketManagementProps) {
  const [content, setContent] = useState("");
  const [files, setFiles] = useState<{ url: string; name: string }[]>([]);
  const [, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  
  // CORRECCIÓN: Uso de useActionState (React 19)
  const [state, formAction, isPending] = useActionState<UpdateTicketState, FormData>(
    updateTicketFull, 
    null
  );

  const isSupport = ["ADMIN", "SOPORTE", "DESARROLLO"].includes(userRole);
  const supportLevel = ticket.client.supportLevel;

  // Limpiar RichEditor tras éxito sin causar "Cascading Renders"
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
    <div className="card-module border-t-4 border-t-brand-600 bg-white dark:bg-slate-900 shadow-xl border-slate-200 dark:border-slate-800 overflow-hidden">
      <div className="p-1 lg:p-8">
        <div className="flex items-center gap-2 mb-6">
          <Settings2 size={18} className="text-brand-600" />
          <h3 className="font-black text-sm lg:text-lg text-slate-900 dark:text-white tracking-tight uppercase">
            {isSupport ? "Gestión y Respuesta Técnica" : "Añadir Información al Ticket"}
          </h3>
        </div>

        {state?.message && !state.success && (
          <div className="mb-6 flex items-center gap-3 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-red-600 dark:text-red-400 text-xs font-bold animate-in fade-in">
            <AlertCircle size={18} />
            {state.message}
          </div>
        )}
        
        <form 
          ref={formRef} 
          action={formAction} 
          className="space-y-4 lg:space-y-6"
        >
          <input type="hidden" name="ticketId" value={ticket.id} />
          <input type="hidden" name="comment" value={content} />
          <input type="hidden" name="attachments" value={JSON.stringify(files)} />
          
          {!isSupport && (
            <>
              <input type="hidden" name="assignedToId" value={ticket.assignedToId || ""} />
              <input type="hidden" name="priorityId" value={ticket.priorityId} />
              <input type="hidden" name="categoryId" value={ticket.categoryId} />
              <input type="hidden" name="statusId" value={ticket.statusId} />
            </>
          )}

          {isSupport && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-4">
              <div className="space-y-1 lg:space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-widest">Asignar a</label>
                <select name="assignedToId" defaultValue={ticket.assignedToId || ""} className="form-input text-[11px] lg:text-xs py-2 dark:bg-slate-800 dark:border-slate-700 w-full">
                  <option value="">Sin asignar</option>
                  {supportUsers.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </div>

              <div className="space-y-1 lg:space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-widest">Prioridad</label>
                <select name="priorityId" defaultValue={ticket.priorityId} className="form-input text-[11px] lg:text-xs py-2 dark:bg-slate-800 dark:border-slate-700 w-full">
                  {priorities.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>

              <div className="space-y-1 lg:space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-widest">Categoría</label>
                <select name="categoryId" defaultValue={ticket.categoryId} className="form-input text-[11px] lg:text-xs py-2 dark:bg-slate-800 dark:border-slate-700 w-full">
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div className="space-y-1 lg:space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-widest">Estado</label>
                <select 
                  name="statusId" 
                  defaultValue={ticket.statusId} 
                  className="form-input text-[11px] lg:text-xs py-2 dark:bg-slate-800 dark:border-slate-700 w-full font-bold"
                  style={{ color: statuses.find(s => s.id === ticket.statusId)?.color }}
                >
                  {statuses.map((s) => <option key={s.id} value={s.id} style={{ color: s.color }}>{s.name}</option>)}
                </select>
              </div>
            </div>
          )}

          {isSupport && supportLevel && (supportLevel.showTimeAnalysis || supportLevel.showTimeDev || supportLevel.showTimeSupport || supportLevel.showTimeUpdate) && (
            <div className="bg-brand-50/50 dark:bg-slate-800/30 border border-brand-100 dark:border-slate-700 p-4 rounded-xl space-y-3">
              <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400">
                <Clock size={16} />
                <h4 className="text-[10px] font-black uppercase tracking-widest">Registro de Tiempos (Minutos)</h4>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {supportLevel.showTimeAnalysis && (
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-slate-500">Análisis</label>
                    <input type="number" name="timeAnalysis" min="0" defaultValue="0" className="form-input py-1.5 text-xs bg-white dark:bg-slate-900" />
                  </div>
                )}
                {supportLevel.showTimeDev && (
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-slate-500">Desarrollo</label>
                    <input type="number" name="timeDev" min="0" defaultValue="0" className="form-input py-1.5 text-xs bg-white dark:bg-slate-900" />
                  </div>
                )}
                {supportLevel.showTimeSupport && (
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-slate-500">Soporte/Gestión</label>
                    <input type="number" name="timeSupport" min="0" defaultValue="0" className="form-input py-1.5 text-xs bg-white dark:bg-slate-900" />
                  </div>
                )}
                {supportLevel.showTimeUpdate && (
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-slate-500">Actualizaciones</label>
                    <input type="number" name="timeUpdate" min="0" defaultValue="0" className="form-input py-1.5 text-xs bg-white dark:bg-slate-900" />
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="space-y-1 lg:space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-widest">
              {isSupport ? "Escribir Respuesta o Solución" : "Tu Mensaje / Consulta"}
            </label>
            <RichEditor content={content} onChange={setContent} />
            {state?.errors?.comment && <p className="text-[10px] text-red-500 font-bold">{state.errors.comment[0]}</p>}
          </div>

          {files.length > 0 && (
            <div className="flex flex-wrap gap-2 p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
              {files.map((file, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg border text-[10px] font-bold text-slate-600 dark:text-slate-300">
                  <Paperclip className="w-3 h-3 text-brand-500" />
                  <span className="truncate max-w-[150px]">{file.name}</span>
                  <button type="button" onClick={() => setFiles(prev => prev.filter((_, i) => i !== idx))} className="text-red-500">
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 lg:gap-6 pt-6 border-t border-slate-100 dark:border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 lg:gap-8">
              <UploadButton
                endpoint="ticketAttachment"
                onClientUploadComplete={(res) => {
                  if (res) {
                    const uploaded = res.map(f => ({ url: f.url, name: f.name }));
                    setFiles(prev => [...prev, ...uploaded]);
                  }
                }}
                appearance={{
                  button: "ut-ready:bg-slate-100 dark:ut-ready:bg-slate-800 ut-ready:text-slate-700 dark:ut-ready:text-slate-300 text-[11px] font-black uppercase h-11 px-6 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center gap-2 w-full lg:w-auto",
                  allowedContent: "hidden"
                }}
                content={{
                  button({ ready }) { return ready ? "Adjuntar Archivos" : "..." }
                }}
              />

              <div className="flex items-center gap-6 p-2 lg:p-0">
                {isSupport && (
                  <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 dark:text-slate-400 cursor-pointer uppercase tracking-widest">
                    <input type="checkbox" name="isInternal" value="true" className="rounded border-slate-300 text-brand-600" />
                    ¿Nota Interna?
                  </label>
                )}

                <label className="flex items-center gap-2 text-[10px] font-black text-brand-600 dark:text-brand-400 cursor-pointer uppercase tracking-widest">
                  <input type="checkbox" name="sendEmailNotification" value="true" defaultChecked className="rounded border-slate-300 text-brand-600" />
                  <Mail size={14} /> ¿Notificar?
                </label>
              </div>
            </div>
            
            <LoadingButton 
              type="submit" 
              isLoading={isPending}
              loadingText="Actualizando..."
              disabled={(!content || content === "<p></p>") && files.length === 0}
              className="w-full lg:w-auto min-w-[200px] py-4 rounded-xl font-black uppercase tracking-[0.2em] text-xs shadow-lg"
            >
              Actualizar Ticket
            </LoadingButton>
          </div>
        </form>
      </div>
    </div>
  );
}
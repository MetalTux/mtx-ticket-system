// src/components/tickets/ticket-form.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UploadButton } from "@/lib/uploadthing";
import { createTicket } from "@/lib/actions/tickets";
import { Priority, Category, ClientCompany, User } from "@prisma/client";
import dynamic from 'next/dynamic';
import { ArrowLeft, Paperclip, X } from "lucide-react";
import LoadingButton from "@/components/ui/loading-button";

const RichEditor = dynamic(() => import('@/components/ui/rich-editor'), { 
  ssr: false,
  loading: () => <div className="h-[120px] w-full bg-slate-100 dark:bg-slate-800 animate-pulse rounded-lg" />
});

interface CompanyWithContacts extends ClientCompany {
  contacts: User[];
}

export default function TicketForm({ 
  companies, 
  isAdmin, 
  defaultClientId,
  sessionUser 
}: { 
  companies: CompanyWithContacts[], 
  isAdmin: boolean,
  defaultClientId?: string,
  sessionUser: { id: string; role: string }
}) {
  const router = useRouter();
  
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<{ url: string; name: string }[]>([]);
  const [selectedClientId, setSelectedClientId] = useState(defaultClientId || "");

  const selectedCompany = companies.find(c => c.id === selectedClientId);
  const availableContacts = selectedCompany?.contacts || [];
  const isClient = sessionUser.role === "CONTACTO_CLIENTE";

  return (
    <div className="space-y-2 lg:space-y-6">
      <button 
        type="button"
        onClick={() => router.back()}
        className="flex items-center gap-2 text-[11px] lg:text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-brand-600 transition-colors group"
      >
        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
        Volver
      </button>

      <form action={createTicket} className="card-module space-y-2 lg:space-y-6 shadow-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 !p-2 lg:!p-8 rounded-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 lg:gap-6">
          
          {/* Bloque Empresa */}
          <div className="space-y-1.5">
            <label className="text-[9px] lg:text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">
              Empresa Cliente
            </label>
            {isAdmin ? (
              <select 
                name="clientId" 
                className="form-input w-full py-2 text-xs lg:text-sm dark:bg-slate-800 dark:border-slate-700 dark:text-white" 
                required 
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
              >
                <option value="">Selecciona empresa...</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            ) : (
              <div className="p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200">
                {selectedCompany?.name || "Empresa Asignada"}
                <input type="hidden" name="clientId" value={defaultClientId || ""} />
              </div>
            )}
          </div>

          {/* Bloque Contacto */}
          <div className="space-y-1.5" suppressHydrationWarning>
            <label className="text-[9px] lg:text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">
              Contacto Solicitante
            </label>
            {!isClient ? (
              <select 
                name="creatorId" 
                className="form-input w-full py-2 text-xs lg:text-sm dark:bg-slate-800 dark:border-slate-700 dark:text-white" 
                required 
                disabled={!selectedClientId}
              >
                <option value="">
                  {selectedClientId ? "Selecciona contacto..." : "Elige empresa primero"}
                </option>
                {availableContacts.map((u) => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            ) : (
              <div className="p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-500 dark:text-slate-400 italic">
                A mi nombre
                <input type="hidden" name="creatorId" value={sessionUser.id} />
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 lg:gap-6">
          <div className="space-y-1.5">
            <label className="text-[9px] lg:text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">Categoría</label>
            <select name="category" className="form-input w-full py-2 text-xs lg:text-sm dark:bg-slate-800 dark:border-slate-700 dark:text-white" defaultValue={Category.SOPORTE}>
              {Object.values(Category).map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] lg:text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">Prioridad</label>
            <select name="priority" className="form-input w-full py-2 text-xs lg:text-sm dark:bg-slate-800 dark:border-slate-700 dark:text-white" required defaultValue={Priority.MEDIA}>
              {Object.values(Priority).map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[9px] lg:text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">Título del Incidente</label>
          <input 
            name="title" 
            type="text" 
            required 
            className="form-input w-full py-2 text-xs lg:text-sm dark:bg-slate-800 dark:border-slate-700 dark:text-white" 
            placeholder="Resumen del problema" 
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[9px] lg:text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">Descripción Detallada</label>
          <input type="hidden" name="description" value={description} />
          <RichEditor content={description} onChange={setDescription} />
        </div>
        
        {/* Zona de Adjuntos Compacta */}
        <div className="space-y-3 p-2 lg:p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 transition-colors">
          <label className="text-[9px] lg:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
            <Paperclip size={12} /> Adjuntos
          </label>
          
          <div className="flex flex-wrap gap-2">
            {files.map((file) => (
              <div key={file.url} className="flex items-center gap-2 p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm">
                <span className="text-[9px] font-bold text-slate-600 dark:text-slate-300 truncate max-w-[120px]">{file.name}</span>
                <button 
                  type="button" 
                  onClick={() => setFiles(files.filter(f => f.url !== file.url))}
                  className="text-red-400 hover:text-red-600 transition-colors"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>

          <UploadButton
            endpoint="ticketAttachment"
            onClientUploadComplete={(res) => {
              if (res) {
                const uploaded = res.map(f => ({ url: f.url, name: f.name }));
                setFiles([...files, ...uploaded]);
              }
            }}
            appearance={{
              button: "ut-ready:bg-brand-600 ut-ready:text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-lg hover:ut-ready:bg-brand-700 transition-all cursor-pointer",
              allowedContent: "text-[9px] text-slate-400 dark:text-slate-500 mt-1"
            }}
            content={{
              button({ ready }) { return ready ? "Subir Archivos" : "..." }
            }}
          />
          <input type="hidden" name="attachments" value={JSON.stringify(files)} />
        </div>

        <LoadingButton 
          type="submit" 
          className="w-full py-2 lg:py-4 text-xs lg:text-base font-black uppercase tracking-widest shadow-lg shadow-brand-500/20"
          loadingText="Enviando..."
        >
          Abrir Ticket
        </LoadingButton>
      </form>
    </div>
  );
}
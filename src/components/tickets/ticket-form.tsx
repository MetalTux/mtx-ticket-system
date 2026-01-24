// src/components/tickets/ticket-form.tsx
"use client";

import { useState } from "react";
import { UploadButton } from "@/lib/uploadthing"; // Importamos el que creamos en lib
import { createTicket } from "@/lib/actions/tickets";
import { Priority, Category, ClientCompany } from "@prisma/client";
import dynamic from 'next/dynamic';

const RichEditor = dynamic(() => import('@/components/ui/rich-editor'), { 
  ssr: false,
  loading: () => <div className="h-[150px] w-full bg-slate-100 animate-pulse rounded-lg" />
});

export default function TicketForm({ 
  companies, 
  isAdmin, 
  defaultClientId 
}: { 
  companies: ClientCompany[], 
  isAdmin: boolean,
  defaultClientId?: string 
}) {
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<{ url: string; name: string }[]>([]);

  return (
    <form action={createTicket} className="card-module space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="form-label">Empresa Cliente</label>
          {isAdmin ? (
            <select name="clientId" className="form-input" required>
              <option value="">Selecciona una empresa...</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          ) : (
            <input type="hidden" name="clientId" value={defaultClientId || ""} />
          )}
        </div>

        <div>
          <label className="form-label">Categoría</label>
          <select name="category" className="form-input" defaultValue={Category.SOPORTE}>
            {Object.values(Category).map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="form-label">Título del Incidente</label>
        <input name="title" type="text" required className="form-input" placeholder="Breve resumen del problema" />
      </div>

      <div>
        <label className="form-label">Prioridad</label>
        <select name="priority" className="form-input" required defaultValue={Priority.MEDIA}>
          {Object.values(Priority).map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="form-label">Descripción Detallada (Formato disponible)</label>
        <input type="hidden" name="description" value={description} />
        <RichEditor content={description} onChange={setDescription} />
      </div>
      
      <div className="space-y-2">
        <label className="form-label">Adjuntar Archivos (Imágenes, Logs, PDF)</label>
        
        {/* Lista de archivos ya subidos */}
        <div className="flex flex-col gap-2">
          {files.map((file) => (
            <div key={file.url} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800 border rounded-md">
              <span className="text-xs truncate">{file.name}</span>
              <button 
                type="button" 
                onClick={() => setFiles(files.filter(f => f.url !== file.url))}
                className="text-red-500 text-xs font-bold"
              >
                Eliminar
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
          onUploadError={(error: Error) => {
            alert(`Error de subida: ${error.message}`);
          }}
          appearance={{
            button: ({ ready, isUploading }) => `
              ut-ready:bg-brand-600 
              ut-uploading:cursor-not-allowed 
              rounded-md 
              text-sm 
              font-medium 
              transition-colors 
              px-6 
              py-2 
              w-full 
              max-w-[200px] 
              h-10 
              flex 
              items-center 
              justify-center 
              whitespace-nowrap
              ${ready ? "bg-[#4F46E5]" : "bg-slate-600"}
            `,
            allowedContent: "text-slate-500 text-[10px] mt-2 uppercase font-medium",
            container: "w-full flex-col items-center justify-center"
          }}
          content={{
            button({ ready, isUploading }) {
              if (isUploading) return "Subiendo...";
              if (ready) return "Seleccionar archivos";
              return "Cargando...";
            },
            allowedContent: "Imágenes, PDF y archivos hasta 16MB"
          }}
        />
        
        {/* Input oculto que envía el JSON al servidor */}
        <input type="hidden" name="attachments" value={JSON.stringify(files)} />
      </div>

      <button type="submit" className="btn-primary w-full">Abrir Ticket</button>
    </form>
  );
}
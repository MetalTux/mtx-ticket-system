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
  loading: () => <div className="h-[150px] w-full bg-slate-100 dark:bg-slate-800 animate-pulse rounded-lg" />
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
    <div className="space-y-6">
      <button 
        type="button"
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-brand-600 transition-colors group"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        Cancelar y volver
      </button>

      <form action={createTicket} className="card-module space-y-6 shadow-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Bloque Empresa */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">
              Empresa Cliente
            </label>
            {isAdmin ? (
              <select 
                name="clientId" 
                className="form-input w-full dark:bg-slate-800 dark:border-slate-700 dark:text-white" 
                required 
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
              >
                <option value="">Selecciona una empresa...</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            ) : (
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-700 dark:text-slate-200">
                {selectedCompany?.name || "Empresa Asignada"}
                <input type="hidden" name="clientId" value={defaultClientId || ""} />
              </div>
            )}
          </div>

          {/* Bloque Contacto */}
          <div className="space-y-2" suppressHydrationWarning>
            <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">
              Contacto Solicitante
            </label>
            {!isClient ? (
              <select 
                name="creatorId" 
                className="form-input w-full dark:bg-slate-800 dark:border-slate-700 dark:text-white" 
                required 
                disabled={!selectedClientId}
              >
                <option value="">
                  {selectedClientId ? "Selecciona el contacto..." : "Primero elige empresa"}
                </option>
                {availableContacts.map((u) => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            ) : (
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-500 dark:text-slate-400 italic">
                Registrado a mi nombre
                <input type="hidden" name="creatorId" value={sessionUser.id} />
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">Categoría</label>
            <select name="category" className="form-input w-full dark:bg-slate-800 dark:border-slate-700 dark:text-white" defaultValue={Category.SOPORTE}>
              {Object.values(Category).map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">Prioridad</label>
            <select name="priority" className="form-input w-full dark:bg-slate-800 dark:border-slate-700 dark:text-white" required defaultValue={Priority.MEDIA}>
              {Object.values(Priority).map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">Título del Incidente</label>
          <input 
            name="title" 
            type="text" 
            required 
            className="form-input w-full dark:bg-slate-800 dark:border-slate-700 dark:text-white" 
            placeholder="Ej: Error al procesar facturas" 
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">Descripción Detallada</label>
          <input type="hidden" name="description" value={description} />
          <RichEditor content={description} onChange={setDescription} />
        </div>
        
        {/* Zona de Adjuntos */}
        <div className="space-y-4 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 transition-colors">
          <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
            <Paperclip size={14} /> Archivos Adjuntos
          </label>
          
          <div className="flex flex-wrap gap-2">
            {files.map((file) => (
              <div key={file.url} className="flex items-center gap-2 p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm">
                <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 truncate max-w-[150px]">{file.name}</span>
                <button 
                  type="button" 
                  onClick={() => setFiles(files.filter(f => f.url !== file.url))}
                  className="text-red-400 hover:text-red-600 transition-colors"
                >
                  <X size={14} />
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
              button: "ut-ready:bg-brand-600 ut-ready:text-white text-xs font-bold px-6 py-2 rounded-lg hover:ut-ready:bg-brand-700 transition-all cursor-pointer",
              allowedContent: "text-[10px] text-slate-400 dark:text-slate-500 mt-2"
            }}
            content={{
              button({ ready }) { return ready ? "Seleccionar Archivos" : "Iniciando..." }
            }}
          />
          <input type="hidden" name="attachments" value={JSON.stringify(files)} />
        </div>

        <LoadingButton 
          type="submit" 
          className="w-full py-4 text-base font-black uppercase tracking-widest shadow-lg shadow-brand-500/20"
          loadingText="Generando Ticket..."
        >
          Abrir Ticket
        </LoadingButton>
      </form>
    </div>
  );
}

// // src/components/tickets/ticket-form.tsx
// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import { UploadButton } from "@/lib/uploadthing";
// import { createTicket } from "@/lib/actions/tickets";
// import { Priority, Category, ClientCompany, User } from "@prisma/client";
// import dynamic from 'next/dynamic';
// import { ArrowLeft, Paperclip, X } from "lucide-react";
// import LoadingButton from "@/components/ui/loading-button";

// const RichEditor = dynamic(() => import('@/components/ui/rich-editor'), { 
//   ssr: false,
//   loading: () => <div className="h-[150px] w-full bg-slate-100 animate-pulse rounded-lg" />
// });

// interface CompanyWithContacts extends ClientCompany {
//   contacts: User[];
// }

// export default function TicketForm({ 
//   companies, 
//   isAdmin, 
//   defaultClientId,
//   sessionUser 
// }: { 
//   companies: CompanyWithContacts[], 
//   isAdmin: boolean,
//   defaultClientId?: string,
//   sessionUser: { id: string; role: string }
// }) {
//   const router = useRouter();
  
//   const [description, setDescription] = useState("");
//   const [files, setFiles] = useState<{ url: string; name: string }[]>([]);
//   const [selectedClientId, setSelectedClientId] = useState(defaultClientId || "");

//   // Derivamos los datos directamente. Esto es eficiente y evita useEffects innecesarios.
//   const selectedCompany = companies.find(c => c.id === selectedClientId);
//   const availableContacts = selectedCompany?.contacts || [];
//   const isClient = sessionUser.role === "CONTACTO_CLIENTE";

//   return (
//     <div className="space-y-4">
//       {/* Botón Volver */}
//       <button 
//         type="button"
//         onClick={() => router.back()}
//         className="flex items-center gap-2 text-sm text-slate-500 hover:text-brand-600 transition-colors"
//       >
//         <ArrowLeft size={16} />
//         Cancelar y volver
//       </button>

//       <form action={createTicket} className="card-module space-y-6 shadow-xl border-slate-200">
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
//           {/* Bloque Empresa */}
//           <div className="space-y-2">
//             <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
//               Empresa Cliente
//             </label>
//             {isAdmin ? (
//               <select 
//                 name="clientId" 
//                 className="form-input w-full" 
//                 required 
//                 value={selectedClientId}
//                 onChange={(e) => setSelectedClientId(e.target.value)}
//               >
//                 <option value="">Selecciona una empresa...</option>
//                 {companies.map((c) => (
//                   <option key={c.id} value={c.id}>{c.name}</option>
//                 ))}
//               </select>
//             ) : (
//               <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-sm font-bold text-slate-700">
//                 {selectedCompany?.name || "Empresa Asignada"}
//                 <input type="hidden" name="clientId" value={defaultClientId || ""} />
//               </div>
//             )}
//           </div>

//           {/* Bloque Contacto - Usamos suppressHydrationWarning para evitar errores por el texto dinámico */}
//           <div className="space-y-2" suppressHydrationWarning>
//             <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
//               Contacto Solicitante
//             </label>
//             {!isClient ? (
//               <select 
//                 name="creatorId" 
//                 className="form-input w-full" 
//                 required 
//                 disabled={!selectedClientId}
//               >
//                 <option value="">
//                   {selectedClientId ? "Selecciona el contacto..." : "Primero elige empresa"}
//                 </option>
//                 {availableContacts.map((u) => (
//                   <option key={u.id} value={u.id}>{u.name}</option>
//                 ))}
//               </select>
//             ) : (
//               <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-sm font-medium text-slate-500 italic">
//                 Registrado a mi nombre
//                 <input type="hidden" name="creatorId" value={sessionUser.id} />
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Clasificación */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           <div className="space-y-2">
//             <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Categoría</label>
//             <select name="category" className="form-input w-full" defaultValue={Category.SOPORTE}>
//               {Object.values(Category).map((cat) => (
//                 <option key={cat} value={cat}>{cat}</option>
//               ))}
//             </select>
//           </div>

//           <div className="space-y-2">
//             <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Prioridad</label>
//             <select name="priority" className="form-input w-full" required defaultValue={Priority.MEDIA}>
//               {Object.values(Priority).map((p) => (
//                 <option key={p} value={p}>{p}</option>
//               ))}
//             </select>
//           </div>
//         </div>

//         {/* Título */}
//         <div className="space-y-2">
//           <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Título del Incidente</label>
//           <input 
//             name="title" 
//             type="text" 
//             required 
//             className="form-input w-full" 
//             placeholder="Ej: Error al procesar facturas" 
//           />
//         </div>

//         {/* Editor de Texto */}
//         <div className="space-y-2">
//           <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Descripción Detallada</label>
//           <input type="hidden" name="description" value={description} />
//           <RichEditor content={description} onChange={setDescription} />
//         </div>
        
//         {/* Adjuntos */}
//         <div className="space-y-4 p-4 bg-slate-50 rounded-xl border border-dashed border-slate-300">
//           <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">
//             Archivos Adjuntos
//           </label>
          
//           <div className="flex flex-wrap gap-2">
//             {files.map((file) => (
//               <div key={file.url} className="flex items-center gap-2 p-2 bg-white border rounded-lg shadow-sm">
//                 <span className="text-[10px] font-bold text-slate-600 truncate max-w-[150px]">{file.name}</span>
//                 <button 
//                   type="button" 
//                   onClick={() => setFiles(files.filter(f => f.url !== file.url))}
//                   className="text-red-400 hover:text-red-600"
//                 >
//                   <X size={14} />
//                 </button>
//               </div>
//             ))}
//           </div>

//           <UploadButton
//             endpoint="ticketAttachment"
//             onClientUploadComplete={(res) => {
//               if (res) {
//                 const uploaded = res.map(f => ({ url: f.url, name: f.name }));
//                 setFiles([...files, ...uploaded]);
//               }
//             }}
//             onUploadError={(error: Error) => alert(`Error: ${error.message}`)}
//             content={{
//               button({ ready }) { return ready ? "Subir Archivos" : "Cargando..." }
//             }}
//           />
//           <input type="hidden" name="attachments" value={JSON.stringify(files)} />
//         </div>

//         <LoadingButton 
//           type="submit" 
//           className="w-full py-4 text-base font-black uppercase tracking-widest shadow-lg shadow-brand-500/20"
//           loadingText="Creando Requerimiento..."
//         >
//           Abrir Ticket
//         </LoadingButton>
//         {/* <button type="submit" className="btn-primary w-full py-4 text-base font-black uppercase tracking-widest shadow-lg shadow-brand-500/20">
//           Abrir Ticket
//         </button> */}
//       </form>
//     </div>
//   );
// }
// src/components/tickets/ticket-management-panel.tsx
"use client";

import { useState, useRef, useTransition } from "react";
import { Priority, Category, TicketStatus, User, Ticket } from "@prisma/client";
import dynamic from 'next/dynamic';
import { updateTicketFull } from "@/lib/actions/tickets";
import { STATUS_LABELS, PRIORITY_LABELS, CATEGORY_LABELS } from "@/enums/constantes";
import { UploadButton } from "@/lib/uploadthing";
import { X, Paperclip, Mail } from "lucide-react"; // Añadimos Mail
import LoadingButton from "@/components/ui/loading-button";

const RichEditor = dynamic(() => import('@/components/ui/rich-editor'), { 
  ssr: false,
  loading: () => <div className="h-[200px] w-full bg-slate-100 dark:bg-slate-800 animate-pulse rounded-lg border border-slate-200 dark:border-slate-700" />
});

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
  const [files, setFiles] = useState<{ url: string; name: string }[]>([]);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const isSupport = userRole !== "CONTACTO_CLIENTE";

  return (
    <div className="card-module border-t-4 border-t-brand-600 bg-white dark:bg-slate-900 shadow-xl border-slate-200 dark:border-slate-800 overflow-hidden">
      <div className="p-6 sm:p-8">
        <h3 className="font-black text-lg mb-6 text-slate-900 dark:text-white tracking-tight uppercase">
          {isSupport ? "Panel de Gestión Técnica" : "Información Adicional"}
        </h3>
        
        <form 
          ref={formRef} 
          action={async (formData) => {
            startTransition(async () => {
              await updateTicketFull(formData);
              setContent(""); 
              setFiles([]);
              formRef.current?.reset();
            });
          }} 
          className="space-y-6"
        >
          <input type="hidden" name="ticketId" value={ticket.id} />
          <input type="hidden" name="comment" value={content} />
          <input type="hidden" name="attachments" value={JSON.stringify(files)} />
          
          {!isSupport && (
            <>
              <input type="hidden" name="assignedToId" value={ticket.assignedToId || ""} />
              <input type="hidden" name="priority" value={ticket.priority} />
              <input type="hidden" name="category" value={ticket.category} />
              <input type="hidden" name="status" value={ticket.status} />
            </>
          )}

          {isSupport && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Selector: Asignación */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-widest">
                  Asignar a
                </label>
                <select 
                  name="assignedToId" 
                  defaultValue={ticket.assignedToId || ""} 
                  className="form-input text-xs dark:bg-slate-800 dark:border-slate-700 w-full"
                >
                  <option value="">Sin asignar</option>
                  {supportUsers.map((u) => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </div>

              {/* Selector: Prioridad */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-widest">
                  Prioridad
                </label>
                <select 
                  name="priority" 
                  defaultValue={ticket.priority} 
                  className="form-input text-xs dark:bg-slate-800 dark:border-slate-700 w-full"
                >
                  {Object.values(Priority).map((p) => (
                    <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>
                  ))}
                </select>
              </div>

              {/* Selector: Categoría */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-widest">
                  Categoría
                </label>
                <select 
                  name="category" 
                  defaultValue={ticket.category} 
                  className="form-input text-xs dark:bg-slate-800 dark:border-slate-700 w-full"
                >
                  {Object.values(Category).map((c) => (
                    <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
                  ))}
                </select>
              </div>

              {/* Selector: Estado */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-widest">
                  Estado
                </label>
                <select 
                  name="status" 
                  defaultValue={ticket.status} 
                  className="form-input text-xs dark:bg-slate-800 dark:border-slate-700 w-full"
                >
                  {Object.values(TicketStatus).map((s) => (
                    <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-widest">
              {isSupport ? "Respuesta Técnica / Solución" : "Comentarios Adicionales"}
            </label>
            <RichEditor content={content} onChange={setContent} />
          </div>

          {/* Listado de archivos cargados en el panel */}
          {files.length > 0 && (
            <div className="flex flex-wrap gap-2 p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
              {files.map((file, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg border dark:border-slate-700 text-[11px] font-bold text-slate-600 dark:text-slate-300">
                  <Paperclip className="w-3 h-3 text-brand-500" />
                  <span className="truncate max-w-[200px]">{file.name}</span>
                  <button type="button" onClick={() => setFiles(prev => prev.filter((_, i) => i !== idx))} className="text-red-500 hover:text-red-700 ml-1 transition-colors">
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-6 pt-6 border-t border-slate-100 dark:border-slate-800">
            <div className="flex flex-wrap items-center gap-6">
              {!isPending && (
                <UploadButton
                  endpoint="ticketAttachment"
                  onClientUploadComplete={(res) => {
                    if (res) {
                      const uploaded = res.map(f => ({ url: f.url, name: f.name }));
                      setFiles(prev => [...prev, ...uploaded]);
                    }
                  }}
                  appearance={{
                    button: "ut-ready:bg-slate-100 dark:ut-ready:bg-slate-800 ut-ready:text-slate-700 dark:ut-ready:text-slate-300 text-xs font-bold h-10 px-5 w-auto border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer rounded-xl",
                    allowedContent: "hidden"
                  }}
                  content={{
                    button({ ready }) {
                      return (
                        <div className="flex items-center gap-2">
                          <Paperclip size={14} />
                          {ready ? "Adjuntar Archivos" : "Cargando..."}
                        </div>
                      );
                    }
                  }}
                />
              )}

              <div className="flex items-center gap-6">
                {isSupport && (
                  <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 dark:text-slate-400 cursor-pointer uppercase tracking-widest hover:text-brand-600 transition-colors">
                    <input type="checkbox" name="isInternal" value="true" className="rounded-md border-slate-300 dark:bg-slate-800 dark:border-slate-700 text-brand-600 focus:ring-brand-500" />
                    ¿Nota Interna?
                  </label>
                )}

                {/* FUNCIONALIDAD NUEVA: Notificación por Email */}
                <label className="flex items-center gap-2 text-[10px] font-black text-brand-600 dark:text-brand-400 cursor-pointer uppercase tracking-widest hover:opacity-80 transition-opacity">
                  <input 
                    type="checkbox" 
                    name="sendEmailNotification" 
                    value="true" 
                    defaultChecked={true} 
                    className="rounded-md border-slate-300 dark:bg-slate-800 dark:border-slate-700 text-brand-600 focus:ring-brand-500" 
                  />
                  <Mail size={14} />
                  ¿Notificar x Email?
                </label>
              </div>
            </div>
            
            <LoadingButton 
              type="submit" 
              isLoading={isPending}
              loadingText="Procesando..."
              disabled={(!content || content === "<p></p>") && files.length === 0}
              className="min-w-[180px] py-3 rounded-xl font-black uppercase tracking-widest text-xs"
            >
              Actualizar Ticket
            </LoadingButton>
          </div>
        </form>
      </div>
    </div>
  );
}

// // src/components/tickets/ticket-management-panel.tsx
// "use client";

// import { useState, useRef, useTransition } from "react";
// import { Priority, Category, TicketStatus, User, Ticket } from "@prisma/client";
// import dynamic from 'next/dynamic';
// import { updateTicketFull } from "@/lib/actions/tickets";
// import { STATUS_LABELS, PRIORITY_LABELS, CATEGORY_LABELS } from "@/enums/constantes";
// import { UploadButton } from "@/lib/uploadthing";
// import { X, Paperclip } from "lucide-react";
// import LoadingButton from "@/components/ui/loading-button";

// const RichEditor = dynamic(() => import('@/components/ui/rich-editor'), { 
//   ssr: false,
//   loading: () => <div className="h-[200px] w-full bg-slate-100 dark:bg-slate-800 animate-pulse rounded-lg border border-slate-200 dark:border-slate-700" />
// });

// interface TicketManagementProps {
//   ticket: Ticket;
//   supportUsers: User[];
//   userRole: string;
// }

// export default function TicketManagementPanel({ 
//   ticket, 
//   supportUsers,
//   userRole 
// }: TicketManagementProps) {
//   const [content, setContent] = useState("");
//   const [files, setFiles] = useState<{ url: string; name: string }[]>([]);
//   const [isPending, startTransition] = useTransition();
//   const formRef = useRef<HTMLFormElement>(null);
//   const isSupport = userRole !== "CONTACTO_CLIENTE";

//   return (
//     <div className="card-module border-t-4 border-t-brand-600 bg-white dark:bg-slate-900 shadow-xl border-slate-200 dark:border-slate-800 overflow-hidden">
//       <div className="p-6 sm:p-8">
//         <h3 className="font-black text-lg mb-6 text-slate-900 dark:text-white tracking-tight uppercase">
//           {isSupport ? "Panel de Gestión Técnica" : "Información Adicional"}
//         </h3>
        
//         <form 
//           ref={formRef} 
//           action={async (formData) => {
//             startTransition(async () => {
//               await updateTicketFull(formData);
//               setContent(""); 
//               setFiles([]);
//               formRef.current?.reset();
//             });
//           }} 
//           className="space-y-6"
//         >
//           <input type="hidden" name="ticketId" value={ticket.id} />
//           <input type="hidden" name="comment" value={content} />
//           <input type="hidden" name="attachments" value={JSON.stringify(files)} />
          
//           {!isSupport && (
//             <>
//               <input type="hidden" name="assignedToId" value={ticket.assignedToId || ""} />
//               <input type="hidden" name="priority" value={ticket.priority} />
//               <input type="hidden" name="category" value={ticket.category} />
//               <input type="hidden" name="status" value={ticket.status} />
//             </>
//           )}

//           {isSupport && (
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//               {/* Selector: Asignación */}
//               <div className="space-y-2">
//                 <label className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-widest">
//                   Asignar a
//                 </label>
//                 <select 
//                   name="assignedToId" 
//                   defaultValue={ticket.assignedToId || ""} 
//                   className="form-input text-xs dark:bg-slate-800 dark:border-slate-700 w-full"
//                 >
//                   <option value="">Sin asignar</option>
//                   {supportUsers.map((u) => (
//                     <option key={u.id} value={u.id}>{u.name}</option>
//                   ))}
//                 </select>
//               </div>

//               {/* Selector: Prioridad */}
//               <div className="space-y-2">
//                 <label className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-widest">
//                   Prioridad
//                 </label>
//                 <select 
//                   name="priority" 
//                   defaultValue={ticket.priority} 
//                   className="form-input text-xs dark:bg-slate-800 dark:border-slate-700 w-full"
//                 >
//                   {Object.values(Priority).map((p) => (
//                     <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>
//                   ))}
//                 </select>
//               </div>

//               {/* Selector: Categoría */}
//               <div className="space-y-2">
//                 <label className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-widest">
//                   Categoría
//                 </label>
//                 <select 
//                   name="category" 
//                   defaultValue={ticket.category} 
//                   className="form-input text-xs dark:bg-slate-800 dark:border-slate-700 w-full"
//                 >
//                   {Object.values(Category).map((c) => (
//                     <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
//                   ))}
//                 </select>
//               </div>

//               {/* Selector: Estado */}
//               <div className="space-y-2">
//                 <label className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-widest">
//                   Estado
//                 </label>
//                 <select 
//                   name="status" 
//                   defaultValue={ticket.status} 
//                   className="form-input text-xs dark:bg-slate-800 dark:border-slate-700 w-full"
//                 >
//                   {Object.values(TicketStatus).map((s) => (
//                     <option key={s} value={s}>{STATUS_LABELS[s]}</option>
//                   ))}
//                 </select>
//               </div>
//             </div>
//           )}

//           <div className="space-y-2">
//             <label className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-widest">
//               {isSupport ? "Respuesta Técnica / Solución" : "Comentarios Adicionales"}
//             </label>
//             <RichEditor content={content} onChange={setContent} />
//           </div>

//           {/* Listado de archivos cargados en el panel */}
//           {files.length > 0 && (
//             <div className="flex flex-wrap gap-2 p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
//               {files.map((file, idx) => (
//                 <div key={idx} className="flex items-center gap-2 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg border dark:border-slate-700 text-[11px] font-bold text-slate-600 dark:text-slate-300">
//                   <Paperclip className="w-3 h-3 text-brand-500" />
//                   <span className="truncate max-w-[200px]">{file.name}</span>
//                   <button type="button" onClick={() => setFiles(prev => prev.filter((_, i) => i !== idx))} className="text-red-500 hover:text-red-700 ml-1 transition-colors">
//                     <X size={14} />
//                   </button>
//                 </div>
//               ))}
//             </div>
//           )}

//           <div className="flex flex-wrap items-center justify-between gap-6 pt-6 border-t border-slate-100 dark:border-slate-800">
//             <div className="flex items-center gap-6">
//               {!isPending && (
//                 <UploadButton
//                   endpoint="ticketAttachment"
//                   onClientUploadComplete={(res) => {
//                     if (res) {
//                       const uploaded = res.map(f => ({ url: f.url, name: f.name }));
//                       setFiles(prev => [...prev, ...uploaded]);
//                     }
//                   }}
//                   appearance={{
//                     button: "ut-ready:bg-slate-100 dark:ut-ready:bg-slate-800 ut-ready:text-slate-700 dark:ut-ready:text-slate-300 text-xs font-bold h-10 px-5 w-auto border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer rounded-xl",
//                     allowedContent: "hidden"
//                   }}
//                   content={{
//                     button({ ready }) {
//                       return (
//                         <div className="flex items-center gap-2">
//                           <Paperclip size={14} />
//                           {ready ? "Adjuntar Archivos" : "Cargando..."}
//                         </div>
//                       );
//                     }
//                   }}
//                 />
//               )}

//               {isSupport && (
//                 <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 dark:text-slate-400 cursor-pointer uppercase tracking-widest hover:text-brand-600 transition-colors">
//                   <input type="checkbox" name="isInternal" value="true" className="rounded-md border-slate-300 dark:bg-slate-800 dark:border-slate-700 text-brand-600 focus:ring-brand-500" />
//                   ¿Nota Interna?
//                 </label>
//               )}
//             </div>
            
//             <LoadingButton 
//               type="submit" 
//               isLoading={isPending}
//               loadingText="Procesando..."
//               disabled={(!content || content === "<p></p>") && files.length === 0}
//               className="min-w-[180px] py-3 rounded-xl font-black uppercase tracking-widest text-xs"
//             >
//               Actualizar Ticket
//             </LoadingButton>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }

// // src/components/tickets/ticket-management-panel.tsx
// "use client";

// import { useState, useRef, useTransition } from "react";
// import { Priority, Category, TicketStatus, User, Ticket } from "@prisma/client";
// import dynamic from 'next/dynamic';
// import { updateTicketFull } from "@/lib/actions/tickets";
// import { STATUS_LABELS, PRIORITY_LABELS, CATEGORY_LABELS } from "@/enums/constantes";
// import { UploadButton } from "@/lib/uploadthing";
// import { X, Paperclip } from "lucide-react";
// import LoadingButton from "@/components/ui/loading-button";

// const RichEditor = dynamic(() => import('@/components/ui/rich-editor'), { 
//   ssr: false,
//   loading: () => <div className="h-[150px] w-full bg-slate-100 dark:bg-slate-800 animate-pulse rounded-lg" />
// });

// interface TicketManagementProps {
//   ticket: Ticket;
//   supportUsers: User[];
//   userRole: string;
// }

// export default function TicketManagementPanel({ 
//   ticket, 
//   supportUsers,
//   userRole 
// }: TicketManagementProps) {
//   const [content, setContent] = useState("");
//   const [files, setFiles] = useState<{ url: string; name: string }[]>([]);
//   const [isPending, startTransition] = useTransition();
//   const formRef = useRef<HTMLFormElement>(null);
//   const isSupport = userRole !== "CONTACTO_CLIENTE";

//   return (
//     <div className="card-module border-t-4 border-t-brand-600 bg-white dark:bg-slate-900 shadow-xl border-slate-200 dark:border-slate-800 transition-colors">
//       <h3 className="font-bold text-lg mb-4 text-slate-900 dark:text-white">
//         {isSupport ? "Gestión y Respuesta" : "Agregar información adicional"}
//       </h3>
      
//       <form 
//         ref={formRef} 
//         action={async (formData) => {
//           startTransition(async () => {
//             await updateTicketFull(formData);
//             setContent(""); 
//             setFiles([]);
//             formRef.current?.reset();
//           });
//         }} 
//         className="space-y-4"
//       >
//         <input type="hidden" name="ticketId" value={ticket.id} />
//         <input type="hidden" name="comment" value={content} />
//         <input type="hidden" name="attachments" value={JSON.stringify(files)} />
        
//         {!isSupport && (
//           <>
//             <input type="hidden" name="assignedToId" value={ticket.assignedToId || ""} />
//             <input type="hidden" name="priority" value={ticket.priority} />
//             <input type="hidden" name="category" value={ticket.category} />
//             <input type="hidden" name="status" value={ticket.status} />
//           </>
//         )}

//         {isSupport && (
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//             <div className="space-y-1">
//               <label className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">Asignar a</label>
//               <select name="assignedToId" defaultValue={ticket.assignedToId || ""} className="form-input text-sm dark:bg-slate-800 dark:border-slate-700">
//                 <option value="">Sin asignar</option>
//                 {supportUsers.filter(u => u.isActive).map(u => (
//                   <option key={u.id} value={u.id}>{u.name}</option>
//                 ))}
//               </select>
//             </div>

//             <div className="space-y-1">
//               <label className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">Prioridad</label>
//               <select name="priority" defaultValue={ticket.priority} className="form-input text-sm dark:bg-slate-800 dark:border-slate-700">
//                 {Object.values(Priority).map(p => <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>)}
//               </select>
//             </div>

//             <div className="space-y-1">
//               <label className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">Categoría</label>
//               <select name="category" defaultValue={ticket.category} className="form-input text-sm dark:bg-slate-800 dark:border-slate-700">
//                 {Object.values(Category).map(c => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
//               </select>
//             </div>

//             <div className="space-y-1">
//               <label className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">Estado</label>
//               <select name="status" defaultValue={ticket.status} className="form-input text-sm dark:bg-slate-800 dark:border-slate-700">
//                 {Object.values(TicketStatus).map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
//               </select>
//             </div>
//           </div>
//         )}

//         <div className="mt-4">
//           <label className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1 block">
//             {isSupport ? "Comentario Técnico / Respuesta" : "Información adicional"}
//           </label>
//           <RichEditor content={content} onChange={setContent} />
//         </div>

//         {files.length > 0 && (
//           <div className="flex flex-wrap gap-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
//             {files.map((file, idx) => (
//               <div key={idx} className="flex items-center gap-2 bg-white dark:bg-slate-900 px-2 py-1 rounded border dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300">
//                 <Paperclip className="w-3 h-3" />
//                 <span className="truncate max-w-[150px]">{file.name}</span>
//                 <button type="button" onClick={() => setFiles(prev => prev.filter((_, i) => i !== idx))} className="text-red-500 hover:text-red-700 ml-1">
//                   <X className="w-3 h-3" />
//                 </button>
//               </div>
//             ))}
//           </div>
//         )}

//         <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
//           <div className="flex items-center gap-4">
//             {!isPending && (
//               <UploadButton
//                 endpoint="ticketAttachment"
//                 onClientUploadComplete={(res) => {
//                   if (res) {
//                     const uploaded = res.map(f => ({ url: f.url, name: f.name }));
//                     setFiles(prev => [...prev, ...uploaded]);
//                   }
//                 }}
//                 appearance={{
//                   button: "ut-ready:bg-slate-100 dark:ut-ready:bg-slate-800 ut-ready:text-slate-700 dark:ut-ready:text-slate-200 text-xs h-9 px-4 w-auto border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer",
//                   allowedContent: "hidden"
//                 }}
//                 content={{
//                   button({ ready }) {
//                     return (
//                       <div className="flex items-center gap-2">
//                         <Paperclip size={14} />
//                         {ready ? "Adjuntar archivos" : "Cargando..."}
//                       </div>
//                     );
//                   }
//                 }}
//               />
//             )}

//             {isSupport && (
//               <label className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 cursor-pointer font-medium">
//                 <input type="checkbox" name="isInternal" value="true" className="rounded dark:bg-slate-800 dark:border-slate-700" />
//                 ¿Nota interna?
//               </label>
//             )}
//           </div>
          
//           <LoadingButton 
//             type="submit" 
//             isLoading={isPending}
//             loadingText="Guardando..."
//             disabled={(!content || content === "<p></p>") && files.length === 0}
//             className="min-w-[160px] py-2"
//           >
//             Actualizar Ticket
//           </LoadingButton>
//         </div>
//       </form>
//     </div>
//   );
// }
// src/components/tickets/ticket-management-panel.tsx
"use client";

import { useState, useRef, useTransition } from "react";
import { Priority, Category, TicketStatus, User, Ticket } from "@prisma/client";
import RichEditor from "@/components/ui/rich-editor";
import { updateTicketFull } from "@/lib/actions/tickets";
import { STATUS_LABELS, PRIORITY_LABELS, CATEGORY_LABELS } from "@/enums/constantes";
import { UploadButton } from "@/lib/uploadthing";
import { X, Paperclip } from "lucide-react";

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
  const [files, setFiles] = useState<{ url: string; name: string }[]>([]); // Estado para adjuntos
  const [isPending, startTransition] = useTransition(); // Hook para manejar el estado de carga del servidor
  const formRef = useRef<HTMLFormElement>(null);
  const isSupport = userRole !== "CONTACTO_CLIENTE";

  return (
    <div className="card-module border-t-4 border-t-brand-600 bg-slate-50/50 dark:bg-slate-900/20">
      <h3 className="font-bold text-lg mb-4 text-slate-900 dark:text-white">
        {isSupport ? "Gestión y Respuesta" : "Agregar información adicional"}
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
        className="space-y-4"
      >
        <input type="hidden" name="ticketId" value={ticket.id} />
        <input type="hidden" name="comment" value={content} />
        {/* Input oculto para enviar los adjuntos como JSON */}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-500">Asignar a</label>
              <select name="assignedToId" defaultValue={ticket.assignedToId || ""} className="form-input text-sm">
                <option value="">Sin asignar</option>
                {supportUsers.filter(u => u.isActive).map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase text-slate-500">Prioridad</label>
              <select name="priority" defaultValue={ticket.priority} className="form-input text-sm">
                {Object.values(Priority).map(p => <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>)}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase text-slate-500">Categoría</label>
              <select name="category" defaultValue={ticket.category} className="form-input text-sm">
                {Object.values(Category).map(c => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase text-slate-500">Estado</label>
              <select name="status" defaultValue={ticket.status} className="form-input text-sm">
                {Object.values(TicketStatus).map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
              </select>
            </div>
          </div>
        )}

        <div className="mt-4">
          <label className="text-[10px] font-bold uppercase text-slate-500">
            {isSupport ? "Comentario Técnico / Respuesta" : "Información adicional"}
          </label>
          <RichEditor content={content} onChange={setContent} />
        </div>

        {/* --- LISTA DE ARCHIVOS CARGADOS --- */}
        {files.length > 0 && (
          <div className="flex flex-wrap gap-2 p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
            {files.map((file, idx) => (
              <div key={idx} className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded border text-xs text-slate-600 dark:text-slate-300">
                <Paperclip className="w-3 h-3" />
                <span className="truncate max-w-[150px]">{file.name}</span>
                <button 
                  type="button" 
                  onClick={() => setFiles(prev => prev.filter((_, i) => i !== idx))}
                  className="text-red-500 hover:text-red-700 ml-1"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-4">
            {/* BOTÓN DE ADJUNTOS */}
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
                  button: "ut-ready:bg-slate-200 dark:ut-ready:bg-slate-800 ut-ready:text-slate-700 dark:ut-ready:text-slate-200 text-xs h-9 px-4 w-auto border border-slate-300 dark:border-slate-700 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors",
                  allowedContent: "hidden"
                }}
                content={{
                  button({ ready }) {
                    return (
                      <div className="flex items-center gap-2">
                        <Paperclip className="w-3 h-3" />
                        {ready ? "Adjuntar archivos" : "Cargando..."}
                      </div>
                    );
                  }
                }}
              />
            )}

            {isSupport && (
              <label className="flex items-center gap-2 text-xs text-slate-500 cursor-pointer">
                <input type="checkbox" name="isInternal" value="true" className="rounded shadow-sm" />
                ¿Nota interna?
              </label>
            )}
          </div>
          
          <button 
            type="submit" 
            className="btn-primary flex items-center gap-2" 
            disabled={isPending || ((!content || content === "<p></p>") && files.length === 0)}
          >
            {isPending ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Guardando...
              </>
            ) : (
              "Actualizar Ticket"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

// // src/components/tickets/ticket-management-panel.tsx
// "use client";

// import { useState, useRef } from "react"; // 1. Agregamos useRef
// import { Priority, Category, TicketStatus, User, Ticket } from "@prisma/client";
// import RichEditor from "@/components/ui/rich-editor";
// import { updateTicketFull } from "@/lib/actions/tickets";
// import { STATUS_LABELS, PRIORITY_LABELS, CATEGORY_LABELS } from "@/enums/constantes";

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
//   const formRef = useRef<HTMLFormElement>(null); // 2. Referencia al formulario
//   const isSupport = userRole !== "CONTACTO_CLIENTE";

//   // 3. Función para manejar el envío y limpiar
//   const handleSubmit = async (formData: FormData) => {
//     await updateTicketFull(formData);
//     // El 'key' en el padre hará la mayor parte del trabajo, 
//     // pero esto asegura que el estado local se limpie inmediatamente.
//     setContent("");
//     formRef.current?.reset();
//   };

//   return (
//     <div className="card-module border-t-4 border-t-brand-600 bg-slate-50/50 dark:bg-slate-900/20">
//       <h3 className="font-bold text-lg mb-4">
//         {isSupport ? "Gestión y Respuesta" : "Agregar información adicional"}
//       </h3>
      
//       {/* 4. Usamos action con la nueva función o mantenemos la original si el key es suficiente */}
//       <form 
//         ref={formRef} 
//         action={async (formData) => {
//           await updateTicketFull(formData);
//           setContent(""); // Limpiar el editor manualmente
//           formRef.current?.reset(); // Limpiar el resto del form
//         }} 
//         className="space-y-4"
//       >
//         <input type="hidden" name="ticketId" value={ticket.id} />
//         <input type="hidden" name="comment" value={content} />
        
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
//             {/* ASIGNACIÓN */}
//             <div>
//               <label className="text-[10px] font-bold uppercase text-slate-500">Asignar a</label>
//               <select name="assignedToId" defaultValue={ticket.assignedToId || ""} className="form-input text-sm">
//                 <option value="">Sin asignar</option>
//                 {supportUsers.map(u => (
//                   <option key={u.id} value={u.id}>{u.name}</option>
//                 ))}
//               </select>
//             </div>

//             {/* PRIORIDAD */}
//             <div>
//               <label className="text-[10px] font-bold uppercase text-slate-500">Prioridad</label>
//               <select name="priority" defaultValue={ticket.priority} className="form-input text-sm">
//                 {Object.values(Priority).map(p => <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>)}
//               </select>
//             </div>

//             {/* CATEGORÍA */}
//             <div>
//               <label className="text-[10px] font-bold uppercase text-slate-500">Categoría</label>
//               <select name="category" defaultValue={ticket.category} className="form-input text-sm">
//                 {Object.values(Category).map(c => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
//               </select>
//             </div>

//             {/* ESTADO */}
//             <div>
//               <label className="text-[10px] font-bold uppercase text-slate-500">Estado</label>
//               <select name="status" defaultValue={ticket.status} className="form-input text-sm">
//                 {Object.values(TicketStatus).map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
//               </select>
//             </div>
//           </div>
//         )}

//         <div className="mt-4">
//           <label className="text-[10px] font-bold uppercase text-slate-500">
//             {isSupport ? "Comentario Técnico / Respuesta" : "Información adicional"}
//           </label>
//           <RichEditor content={content} onChange={setContent} />
//         </div>

//         <div className="flex justify-between items-center pt-2">
//           {isSupport && (
//             <label className="flex items-center gap-2 text-xs text-slate-500 cursor-pointer">
//               <input type="checkbox" name="isInternal" value="true" className="rounded shadow-sm" />
//               ¿Es una nota interna?
//             </label>
//           )}
          
//           <button type="submit" className="btn-primary">
//             Actualizar Ticket
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// }
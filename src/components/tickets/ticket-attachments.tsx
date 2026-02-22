// src/components/tickets/ticket-attachments.tsx
"use client";

import { useState } from "react";
import { Paperclip, Download, FileText, X } from "lucide-react";

interface Attachment {
  url: string;
  name: string;
}

export default function TicketAttachments({ attachments }: { attachments: Attachment[] }) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (!attachments || attachments.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
        <Paperclip className="w-4 h-4" />
        <h3 className="text-[10px] font-black uppercase tracking-widest">Documentos y Evidencias ({attachments.length})</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {attachments.map((file, index) => {
          const isImage = /\.(jpg|jpeg|png|webp|gif)$/i.test(file.name);

          return (
            <div key={index} className="group relative border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-all">
              {isImage ? (
                <div 
                  className="aspect-video w-full bg-slate-100 dark:bg-slate-950 flex items-center justify-center overflow-hidden cursor-zoom-in"
                  onClick={() => setSelectedImage(file.url)}
                >
                  <img
                    src={file.url}
                    alt={file.name}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              ) : (
                <div className="aspect-video w-full bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-slate-400 dark:text-slate-600">
                  <FileText className="w-10 h-10" />
                </div>
              )}

              <div className="p-3 flex items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[11px] font-bold truncate text-slate-600 dark:text-slate-300">
                  {file.name}
                </span>
                <a
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-brand-600 hover:text-white dark:hover:bg-brand-500 dark:hover:text-white transition-all"
                  title="Descargar archivo"
                >
                  <Download className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL DE IMAGEN FULLSCREEN */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 p-4 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setSelectedImage(null)}
        >
          <button 
            className="absolute top-6 right-6 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            onClick={() => setSelectedImage(null)}
          >
            <X className="w-6 h-6" />
          </button>
          
          <img 
            src={selectedImage} 
            className="max-w-full max-h-[90vh] rounded-lg shadow-2xl object-contain animate-in zoom-in-95 duration-300" 
            alt="Vista previa" 
          />
        </div>
      )}
    </div>
  );
}

// // src/components/tickets/ticket-attachments.tsx
// "use client";

// import { useState } from "react";
// import { Paperclip, Download, FileText, X } from "lucide-react";

// interface Attachment {
//   url: string;
//   name: string;
// }

// export default function TicketAttachments({ attachments }: { attachments: Attachment[] }) {
//   const [selectedImage, setSelectedImage] = useState<string | null>(null);

//   if (attachments.length === 0) return null;

//   return (
//     <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
//       <div className="flex items-center gap-2 mb-4 text-slate-900 dark:text-white">
//         <Paperclip className="w-4 h-4" />
//         <h3 className="text-sm font-bold">Archivos Adjuntos ({attachments.length})</h3>
//       </div>

//       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
//         {attachments.map((file, index) => {
//           const isImage = /\.(jpg|jpeg|png|webp|gif)$/i.test(file.name);

//           return (
//             <div key={index} className="group relative border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-white dark:bg-slate-800 hover:shadow-md transition-shadow">
//               {isImage ? (
//                 <div 
//                   className="aspect-video w-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center overflow-hidden cursor-zoom-in"
//                   onClick={() => setSelectedImage(file.url)}
//                 >
//                   <img
//                     src={file.url}
//                     alt={file.name}
//                     className="object-cover w-full h-full group-hover:scale-105 transition-transform"
//                   />
//                 </div>
//               ) : (
//                 <div className="aspect-video w-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-400">
//                   <FileText className="w-10 h-10" />
//                 </div>
//               )}

//               <div className="p-3 flex items-center justify-between gap-2">
//                 <span className="text-xs font-medium truncate text-slate-600 dark:text-slate-300">
//                   {file.name}
//                 </span>
//                 <a
//                   href={file.url}
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   className="p-1.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-brand-600 hover:text-white transition-colors"
//                 >
//                   <Download className="w-3.5 h-3.5" />
//                 </a>
//               </div>
//             </div>
//           );
//         })}
//       </div>

//       {/* --- MODAL / POPUP --- */}
//       {selectedImage && (
//         <div 
//           className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 animate-in fade-in duration-200"
//           onClick={() => setSelectedImage(null)}
//         >
//           <button 
//             className="absolute top-6 right-6 text-white hover:text-slate-300 transition-colors"
//             onClick={() => setSelectedImage(null)}
//           >
//             <X className="w-8 h-8" />
//           </button>
          
//           <img 
//             src={selectedImage} 
//             className="max-w-full max-h-full rounded-lg shadow-2xl object-contain animate-in zoom-in-95 duration-300" 
//             alt="Vista previa" 
//           />
//         </div>
//       )}
//     </div>
//   );
// }
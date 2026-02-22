// src/components/ui/confirm-modal.tsx
"use client";

import { AlertTriangle, CheckCircle2 } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  isLoading?: boolean;
  variant?: "danger" | "success";
}

export default function ConfirmModal({ 
  isOpen, onClose, onConfirm, title, description, isLoading, variant = "danger" 
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const isDanger = variant === "danger";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transform animate-in zoom-in-95">
        <div className="p-8 text-center">
          <div className={`mx-auto w-14 h-14 rounded-full flex items-center justify-center mb-6 border-4 ${
            isDanger 
              ? "bg-red-50 dark:bg-red-900/20 text-red-600 border-red-100 dark:border-red-900/30" 
              : "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 border-emerald-100 dark:border-emerald-900/30"
          }`}>
            {isDanger ? <AlertTriangle size={28} /> : <CheckCircle2 size={28} />}
          </div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">{title}</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
            {description}
          </p>
        </div>
        
        <div className="bg-slate-50 dark:bg-slate-800/50 p-6 flex flex-col sm:flex-row justify-center gap-3 border-t border-slate-100 dark:border-slate-800">
          <button 
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
          >
            Cancelar
          </button>
          <button 
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 px-6 py-2.5 rounded-xl text-sm font-black uppercase tracking-widest text-white shadow-lg transition-all ${
              isDanger 
                ? "bg-red-600 hover:bg-red-700 shadow-red-500/20" 
                : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20"
            } disabled:opacity-50`}
          >
            {isLoading ? "Procesando..." : isDanger ? "Confirmar Baja" : "Reactivar"}
          </button>
        </div>
      </div>
    </div>
  );
}

// // src/components/ui/confirm-modal.tsx
// "use client";

// import { AlertTriangle } from "lucide-react";

// interface ConfirmModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   onConfirm: () => void;
//   title: string;
//   description: string;
//   isLoading?: boolean;
// }

// export default function ConfirmModal({ 
//   isOpen, onClose, onConfirm, title, description, isLoading 
// }: ConfirmModalProps) {
//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
//       <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
//         <div className="p-6 text-center">
//           <div className="mx-auto w-12 h-12 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full flex items-center justify-center mb-4">
//             <AlertTriangle size={24} />
//           </div>
//           <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{title}</h3>
//           <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
//             {description}
//           </p>
//         </div>
        
//         <div className="bg-slate-50 dark:bg-slate-800/50 p-4 flex justify-center gap-3">
//           <button 
//             onClick={onClose}
//             disabled={isLoading}
//             className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700"
//           >
//             Cancelar
//           </button>
//           <button 
//             onClick={onConfirm}
//             disabled={isLoading}
//             className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-xl text-sm font-bold disabled:opacity-50"
//           >
//             {isLoading ? "Eliminando..." : "Eliminar"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }
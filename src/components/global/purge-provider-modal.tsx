// src/components/global/purge-provider-modal.tsx
"use client";

import { useState, useTransition } from "react";
import { clearProviderData } from "@/lib/actions/maintenance";
import { toast } from "sonner";
import { ShieldAlert, Loader2 } from "lucide-react";

interface PurgeProviderModalProps {
  isOpen: boolean;
  onClose: () => void;
  providerId: string;
  providerName: string;
}

export default function PurgeProviderModal({ isOpen, onClose, providerId, providerName }: PurgeProviderModalProps) {
  const [confirmInput, setConfirmInput] = useState("");
  const [isPending, startTransition] = useTransition();

  if (!isOpen) return null;

  // FUNCIÓN ENVOLTORIO: Limpia el estado justo antes de emitir el cierre
  const handleClose = () => {
    if (!isPending) {
      setConfirmInput("");
      onClose();
    }
  };

  const handlePurge = () => {
    if (confirmInput !== "PURGAR") return;

    startTransition(async () => {
      const response = await clearProviderData(providerId);
      
      if (response.success) {
        toast.success(response.message);
        handleClose(); // Usamos nuestra nueva función aquí también
      } else {
        toast.error(response.message);
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-200 space-y-6">
        
        <div className="flex gap-4 text-orange-600 dark:text-orange-500">
          <div className="p-3 bg-orange-50 dark:bg-orange-500/10 rounded-xl h-fit border border-orange-100 dark:border-orange-500/20">
            <ShieldAlert size={28} />
          </div>
          <div>
            <h4 className="text-lg font-black text-slate-900 dark:text-white tracking-tight leading-none mb-1.5">
              Purgar datos de DEMO
            </h4>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
              Estás a punto de eliminar todos los tickets, historiales y clientes de <strong className="text-slate-800 dark:text-slate-200">{providerName}</strong>. Esta acción es irreversible.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-400 text-center">
            Para confirmar, escribe la palabra <strong className="text-orange-600 dark:text-orange-500 font-black tracking-widest uppercase">PURGAR</strong>
          </div>
          <input
            type="text"
            className="form-input w-full py-3 text-sm font-mono tracking-widest uppercase text-center dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-xl focus:border-orange-500 focus:ring-orange-500 transition-colors"
            placeholder="Escribe aquí..."
            value={confirmInput}
            onChange={(e) => setConfirmInput(e.target.value)}
            disabled={isPending}
            autoComplete="off"
          />
        </div>

        <div className="flex gap-2 justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={handleClose} // Reemplazamos la lógica antigua por handleClose
            className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
            disabled={isPending}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handlePurge}
            disabled={confirmInput !== "PURGAR" || isPending}
            className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-300 dark:disabled:bg-orange-900/50 disabled:text-orange-100/50 text-white font-black text-[11px] uppercase tracking-wider px-5 py-2.5 rounded-xl transition-all shadow-md shadow-orange-500/20"
          >
            {isPending ? (
              <>
                <Loader2 size={14} className="animate-spin" /> Procesando...
              </>
            ) : (
              "Confirmar Destrucción"
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
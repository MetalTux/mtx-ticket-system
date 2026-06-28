// src/components/dashboard/super-admin/purge-provider-zone.tsx
"use client";

import { useState, useTransition } from "react";
import { clearProviderData } from "@/lib/actions/maintenance";
import { toast } from "sonner";
import { Trash2, ShieldAlert, Loader2 } from "lucide-react";

interface PurgeProviderZoneProps {
  providerId: string;
  providerName: string;
}

export default function PurgeProviderZone({ providerId, providerName }: PurgeProviderZoneProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [confirmInput, setConfirmInput] = useState("");
  const [isPending, startTransition] = useTransition();

  const handlePurge = () => {
    if (confirmInput !== "PURGAR") return;

    startTransition(async () => {
      const response = await clearProviderData(providerId);
      
      if (response.success) {
        toast.success(response.message);
        setIsOpen(false);
        setConfirmInput("");
      } else {
        toast.error(response.message);
      }
    });
  };

  return (
    <div className="p-6 bg-red-50/50 dark:bg-red-950/10 border border-red-200 dark:border-red-900/30 rounded-2xl space-y-4">
      <div>
        <h3 className="text-sm font-black text-red-800 dark:text-red-400 uppercase tracking-wider flex items-center gap-2">
          <ShieldAlert size={16} /> Zona de Peligro (Ambiente DEMO)
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
          Elimina de forma irreversible todos los tickets, historial, contactos y empresas clientes de <strong className="text-slate-700 dark:text-slate-300">{providerName}</strong>. Las configuraciones internas y el Staff se mantendrán intactos.
        </p>
      </div>

      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 bg-red-600 hover:bg-red-700 transition-colors text-white font-black uppercase text-[10px] tracking-widest px-4 py-2.5 rounded-xl shadow-md shadow-red-600/10"
      >
        <Trash2 size={14} /> Purgar Datos de Pruebas
      </button>

      {/* MODAL DE SEGURIDAD EXTREMA */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl m-4 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex gap-3 text-red-600 dark:text-red-400">
              <div className="p-2 bg-red-50 dark:bg-red-950/30 rounded-xl h-fit">
                <ShieldAlert size={24} />
              </div>
              <div>
                <h4 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                  ¿Confirmas la purga total?
                </h4>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
                  Esta acción eliminará de forma permanente la base operativa del cliente. No se puede deshacer.
                </p>
              </div>
            </div>

            <div className="space-y-1.5 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800 text-[11px] font-medium text-slate-600 dark:text-slate-400">
              Para proceder, escribe la palabra <strong className="text-red-600 dark:text-red-400 font-bold tracking-widest uppercase">PURGAR</strong> a continuación:
            </div>

            <input
              type="text"
              className="form-input w-full py-2.5 text-xs lg:text-sm font-mono tracking-widest uppercase text-center dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl focus:border-red-500 focus:ring-red-500"
              placeholder="Escribe aquí..."
              value={confirmInput}
              onChange={(e) => setConfirmInput(e.target.value)}
              disabled={isPending}
            />

            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => { if (!isPending) setIsOpen(false); setConfirmInput(""); }}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                disabled={isPending}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handlePurge}
                disabled={confirmInput !== "PURGAR" || isPending}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-red-300 dark:disabled:bg-red-950/20 disabled:text-slate-400 text-white font-black text-xs uppercase tracking-wider px-4 py-2 rounded-xl transition-all"
              >
                {isPending ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Purgando...
                  </>
                ) : (
                  "Confirmar Destrucción"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
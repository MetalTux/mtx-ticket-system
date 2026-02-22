// src/components/dashboard/escalation-modal.tsx
"use client";

import { useState } from "react";
import { ShieldAlert, UserCheck, X } from "lucide-react";
import { User } from "@prisma/client";

type SimpleUser = {
  id: string;
  name: string | null;
};

interface EscalationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (userId: string) => void;
  supportUsers: SimpleUser[];
}

export default function EscalationModal({ isOpen, onClose, onConfirm, supportUsers }: EscalationModalProps) {
  const [selectedUserId, setSelectedUserId] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transform animate-in zoom-in-95">
        <div className="p-8">
          <div className="flex justify-between items-start mb-6">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center border border-brand-100 dark:border-brand-500/20">
              <ShieldAlert size={28} />
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
              <X size={20} />
            </button>
          </div>

          <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2 tracking-tighter">Escalar Ticket</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 font-medium leading-relaxed">
            Para escalar este requerimiento, debes asignar un responsable técnico que se encargue de la resolución de segundo nivel.
          </p>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-widest flex items-center gap-2">
                <UserCheck size={14} /> Seleccionar Especialista
              </label>
              <select 
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="form-input w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-sm font-bold"
              >
                <option value="">Selecciona un técnico...</option>
                {supportUsers.map(user => (
                  <option key={user.id} value={user.id}>{user.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/50 p-6 flex gap-3 border-t border-slate-100 dark:border-slate-800">
          <button 
            onClick={onClose}
            className="flex-1 px-4 py-2.5 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          >
            Cancelar
          </button>
          <button 
            onClick={() => onConfirm(selectedUserId)}
            disabled={!selectedUserId}
            className="flex-1 px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-brand-500/20 disabled:opacity-50 disabled:shadow-none transition-all"
          >
            Confirmar Escalado
          </button>
        </div>
      </div>
    </div>
  );
}
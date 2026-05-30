// src/components/settings/master-form-modal.tsx
"use client";

import { useTransition, useState } from "react";
import { saveStatus, savePriority, saveCategory, saveSupportLevel, saveAttentionType } from "@/lib/actions/masters-management";
import { toast } from "sonner";
import LoadingButton from "@/components/ui/loading-button";
import { X } from "lucide-react";
import { MasterType, AnyMaster } from "@/types/masters";
import { TicketStatus, TicketPriority, TicketCategory, SupportLevel, AttentionType } from "@prisma/client";

interface MasterFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: MasterType;
  initialData?: AnyMaster | null;
}

export default function MasterFormModal({ isOpen, onClose, type, initialData }: MasterFormModalProps) {
  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  // Funciones de ayuda para Type Guarding seguro
  const isStatus = (item: AnyMaster): item is TicketStatus => type === 'status';
  const isPriority = (item: AnyMaster): item is TicketPriority => type === 'priority';
  const isCategory = (item: AnyMaster): item is TicketCategory => type === 'category';
  const isSupportLevel = (item: AnyMaster): item is SupportLevel => type === 'supportLevel';
  const isAttentionType = (item: AnyMaster): item is AttentionType => type === 'attentionType';

  const handleSubmit = async (formData: FormData) => {
    setErrors({});
    startTransition(async () => {
      let result;
      
      if (type === 'status') result = await saveStatus(formData);
      else if (type === 'priority') result = await savePriority(formData);
      else if (type === 'category') result = await saveCategory(formData);
      else if (type === 'supportLevel') result = await saveSupportLevel(formData);
      else if (type === 'attentionType') result = await saveAttentionType(formData);

      // Si por alguna razón result es undefined, salimos
      if (!result) {
        toast.error("Error al procesar la solicitud");
        return;
      }

      // Type Guarding seguro usando el operador 'in'
      if ('errors' in result && result.errors) {
        setErrors(result.errors as Record<string, string[]>);
      } else if ('success' in result && result.success) {
        toast.success("Configuración guardada");
        onClose();
      } else if ('message' in result && result.message) {
        toast.error(result.message);
      } else {
        toast.error("Error desconocido al guardar");
      }
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-xl font-black uppercase tracking-tighter text-slate-900 dark:text-white">
            {initialData ? 'Editar' : 'Nueva'} Registro
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form action={handleSubmit} className="p-6 space-y-4">
          <input type="hidden" name="id" value={initialData?.id || ""} />

          {/* Nombre Común a todos */}
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Nombre Visible</label>
            <input name="name" defaultValue={initialData?.name} className="form-input w-full dark:bg-slate-800" required />
          </div>

          {/* Específico para SupportLevel */}
          {type === 'supportLevel' && (
            <div className="space-y-4 border-t border-slate-100 dark:border-slate-800 pt-4 mt-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Descripción Breve</label>
                <input 
                  name="description" 
                  defaultValue={initialData && isSupportLevel(initialData) ? (initialData.description || "") : ""} 
                  className="form-input w-full dark:bg-slate-800" 
                />
              </div>
              <p className="text-[10px] font-black uppercase text-brand-500 tracking-widest mb-2">Campos de Tiempo Requeridos:</p>
              <div className="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                <Checkbox name="showTimeAnalysis" label="Mins. Análisis" defaultChecked={initialData && isSupportLevel(initialData) ? initialData.showTimeAnalysis : false} />
                <Checkbox name="showTimeDev" label="Mins. Desarrollo" defaultChecked={initialData && isSupportLevel(initialData) ? initialData.showTimeDev : false} />
                <Checkbox name="showTimeSupport" label="Mins. Gestión Soporte" defaultChecked={initialData && isSupportLevel(initialData) ? initialData.showTimeSupport : false} />
                <Checkbox name="showTimeUpdate" label="Mins. Actualizaciones" defaultChecked={initialData && isSupportLevel(initialData) ? initialData.showTimeUpdate : false} />
              </div>
            </div>
          )}

          {/* SystemKey (Para AttentionType, Status, Priority) */}
          {['status', 'priority', 'attentionType'].includes(type) && (
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Key de Sistema</label>
              <input 
                name="systemKey" 
                defaultValue={initialData && (isStatus(initialData) || isPriority(initialData) || isAttentionType(initialData)) ? initialData.systemKey : ""} 
                className="form-input w-full dark:bg-slate-800 font-mono text-[10px] uppercase" 
                required 
              />
            </div>
          )}

          {/* Color (Para Status, Priority) */}
          {['status', 'priority'].includes(type) && (
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Color Hex</label>
              <input 
                type="color" 
                name="color" 
                defaultValue={initialData && (isStatus(initialData) || isPriority(initialData)) ? initialData.color : "#64748b"} 
                className="w-full h-10 p-0 border-none bg-transparent" 
              />
            </div>
          )}

          {/* Prefix (Solo Categoría) */}
          {type === 'category' && (
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Prefijo</label>
              <input 
                name="prefix" 
                defaultValue={initialData && isCategory(initialData) ? initialData.prefix : ""} 
                className="form-input w-full uppercase" 
                required 
              />
            </div>
          )}

          <label className="flex items-center gap-2 cursor-pointer pt-2 group">
            <input 
              type="checkbox" 
              name="isActive" 
              defaultChecked={initialData ? (initialData.isActive ?? true) : true} 
              className="rounded border-slate-300 text-brand-600 focus:ring-brand-500" 
            />
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Habilitar registro</span>
          </label>

          <div className="pt-6 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl text-[10px] font-black uppercase text-slate-500 hover:bg-slate-50">Cancelar</button>
            <LoadingButton type="submit" isLoading={isPending} className="flex-1 py-3 text-[10px] font-black uppercase shadow-lg">Confirmar</LoadingButton>
          </div>
        </form>
      </div>
    </div>
  );
}

function Checkbox({ name, label, defaultChecked }: { name: string, label: string, defaultChecked?: boolean }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="rounded border-slate-300 text-brand-600" />
      <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase">{label}</span>
    </label>
  );
}
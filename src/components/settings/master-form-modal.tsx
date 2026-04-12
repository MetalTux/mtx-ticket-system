// src/components/settings/master-form-modal.tsx
"use client";

import { useTransition, useState } from "react";
import { saveStatus, savePriority, saveCategory } from "@/lib/actions/masters-management";
import { MasterType, AnyMaster } from "@/types/masters";
import { TicketStatus, TicketPriority, TicketCategory } from "@prisma/client";
import { toast } from "sonner";
import LoadingButton from "@/components/ui/loading-button";
import { X } from "lucide-react";

interface MasterFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: MasterType;
  initialData?: AnyMaster | null;
}

export default function MasterFormModal({ isOpen, onClose, type, initialData }: MasterFormModalProps) {
  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  // Funciones de ayuda para Type Guarding (Estrechamiento de tipos)
  const isStatus = (item: AnyMaster): item is TicketStatus => type === 'status';
  const isPriority = (item: AnyMaster): item is TicketPriority => type === 'priority';
  const isCategory = (item: AnyMaster): item is TicketCategory => type === 'category';

  const handleSubmit = async (formData: FormData) => {
    setErrors({});
    startTransition(async () => {
      let result;
      
      if (type === 'status') result = await saveStatus(formData);
      else if (type === 'priority') result = await savePriority(formData);
      else result = await saveCategory(formData);

      if (result?.errors) {
        setErrors(result.errors as Record<string, string[]>);
      } else if (result?.success) {
        toast.success("Configuración guardada");
        onClose();
      } else {
        toast.error(result?.message || "Error al procesar la solicitud");
      }
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-xl font-black uppercase tracking-tighter text-slate-900 dark:text-white">
            {initialData ? 'Editar' : 'Nueva'} {type === 'status' ? 'Estado' : type === 'priority' ? 'Prioridad' : 'Categoría'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form action={handleSubmit} className="p-6 space-y-4">
          <input type="hidden" name="id" value={initialData?.id || ""} />

          {/* Nombre (Común a todos los modelos) */}
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Nombre Visible</label>
            <input 
              name="name" 
              defaultValue={initialData?.name}
              placeholder="Ej: Pendiente, Crítica, Soporte..."
              className="form-input w-full dark:bg-slate-800 dark:border-slate-700" 
              required 
            />
            {errors.name && <p className="text-[10px] text-red-500 font-bold">{errors.name[0]}</p>}
          </div>

          {/* Sección para Status y Priority (Comparten systemKey y color) */}
          {initialData && (isStatus(initialData) || isPriority(initialData)) && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Key de Sistema</label>
                  <input 
                    name="systemKey" 
                    defaultValue={initialData.systemKey}
                    placeholder="OPEN, CLOSED..."
                    className="form-input w-full dark:bg-slate-800 dark:border-slate-700 font-mono text-[10px]" 
                    required 
                  />
                  {errors.systemKey && <p className="text-[10px] text-red-500 font-bold">{errors.systemKey[0]}</p>}
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Color</label>
                  <div className="flex gap-2">
                    <input 
                      type="color" 
                      name="color" 
                      defaultValue={initialData.color}
                      className="w-10 h-10 p-0 border-none bg-transparent cursor-pointer" 
                    />
                    <div className="form-input flex-1 text-[10px] dark:bg-slate-800 flex items-center justify-center font-mono opacity-50 uppercase">
                      {initialData.color}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">
                  {type === 'status' ? 'Orden en Tablero' : 'Peso de Prioridad'}
                </label>
                <input 
                  type="number" 
                  name={type === 'status' ? 'order' : 'weight'} 
                  defaultValue={isStatus(initialData) ? initialData.order : (isPriority(initialData) ? initialData.weight : 0)}
                  className="form-input w-full dark:bg-slate-800 dark:border-slate-700" 
                />
              </div>
            </>
          )}

          {/* Sección específica para Categoría */}
          {initialData && isCategory(initialData) && (
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Prefijo de Folio</label>
              <input 
                name="prefix" 
                defaultValue={initialData.prefix}
                placeholder="Ej: INF, SOP, MTX"
                maxLength={5}
                className="form-input w-full dark:bg-slate-800 dark:border-slate-700 uppercase" 
                required 
              />
              {errors.prefix && <p className="text-[10px] text-red-500 font-bold">{errors.prefix[0]}</p>}
            </div>
          )}

          {/* Manejo de inputs para registros nuevos (Sin initialData) */}
          {!initialData && (
            <div className="space-y-4">
              {type !== 'category' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Key</label>
                    <input name="systemKey" className="form-input w-full" required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Color</label>
                    <input type="color" name="color" className="w-full h-10 p-0 border-none bg-transparent" />
                  </div>
                </div>
              )}
              {type === 'category' && (
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Prefijo</label>
                  <input name="prefix" className="form-input w-full uppercase" required />
                </div>
              )}
            </div>
          )}

          <label className="flex items-center gap-2 cursor-pointer pt-2 group">
            <input 
              type="checkbox" 
              name="isActive" 
              defaultChecked={initialData ? (initialData.isActive ?? true) : true}
              className="rounded border-slate-300 text-brand-600 focus:ring-brand-500" 
            />
            <span className="text-[10px] font-black text-slate-500 group-hover:text-slate-800 dark:group-hover:text-slate-300 uppercase tracking-widest transition-colors">Habilitar registro</span>
          </label>

          <div className="pt-6 flex gap-3">
            <button 
              type="button" 
              onClick={onClose} 
              className="flex-1 px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl text-[10px] font-black uppercase text-slate-500 hover:bg-slate-50 transition-all"
            >
              Cancelar
            </button>
            <LoadingButton 
              type="submit" 
              isLoading={isPending}
              loadingText="Guardando..."
              className="flex-1 py-3 text-[10px] font-black uppercase shadow-lg shadow-brand-500/20"
            >
              Confirmar
            </LoadingButton>
          </div>
        </form>
      </div>
    </div>
  );
}
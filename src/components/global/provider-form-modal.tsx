// src/components/global/provider-form-modal.tsx
"use client";

import { useTransition, useState } from "react";
import { saveProvider } from "@/lib/actions/global-management";
import { ProviderCompany } from "@prisma/client";
import { toast } from "sonner";
import LoadingButton from "@/components/ui/loading-button";
import { X, Building2, UserPlus, ShieldCheck } from "lucide-react";

interface ProviderFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: ProviderCompany | null;
}

export default function ProviderFormModal({ isOpen, onClose, initialData }: ProviderFormModalProps) {
  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const handleSubmit = async (formData: FormData) => {
    setErrors({});
    startTransition(async () => {
      const result = await saveProvider(formData);
      if (result?.errors) {
        setErrors(result.errors as Record<string, string[]>);
      } else if (result?.success) {
        toast.success(initialData ? "Empresa actualizada" : "Nuevo Proveedor y Admin creados con éxito");
        onClose();
      } else {
        toast.error(result?.message || "Error en el proceso");
      }
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/60 backdrop-blur-md p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-600 rounded-xl text-white">
              <Building2 size={20} />
            </div>
            <h2 className="text-xl font-black uppercase tracking-tighter">
              {initialData ? 'Editar Empresa' : 'Alta de Nuevo Proveedor'}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <form action={handleSubmit} className="p-8 space-y-6">
          <input type="hidden" name="id" value={initialData?.id || ""} />

          {/* SECCIÓN 1: DATOS DE LA EMPRESA */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-brand-600 dark:text-brand-500">
              <ShieldCheck size={16} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Información Corporativa</span>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Nombre Comercial de la Empresa</label>
              <input 
                name="name" 
                defaultValue={initialData?.name}
                placeholder="Ej: Nexo Solutions Chile"
                className="form-input w-full dark:bg-slate-800"
                required 
              />
              {errors.name && <p className="text-[10px] text-red-500 font-bold">{errors.name[0]}</p>}
            </div>
          </div>

          {/* SECCIÓN 2: DATOS DEL ADMINISTRADOR INICIAL (Solo si es nuevo) */}
          {!initialData && (
            <div className="pt-4 space-y-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-brand-600 dark:text-brand-500">
                <UserPlus size={16} />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Usuario Administrador Inicial</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Nombre Completo</label>
                  <input name="adminName" placeholder="Ej: Juan Pérez" className="form-input w-full dark:bg-slate-800" required />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Correo Electrónico</label>
                  <input name="adminEmail" type="email" placeholder="admin@empresa.com" className="form-input w-full dark:bg-slate-800" required />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Contraseña Temporal</label>
                <input name="password" type="password" placeholder="••••••••" className="form-input w-full dark:bg-slate-800" required />
                <p className="text-[9px] text-slate-400 italic">El usuario podrá cambiarla al iniciar sesión.</p>
              </div>
            </div>
          )}

          <div className="pt-8 flex gap-3">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 py-3 text-[10px] font-black uppercase text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-all"
            >
              Cancelar
            </button>
            <LoadingButton 
              type="submit" 
              isLoading={isPending}
              loadingText="Procesando Alta..."
              className="flex-1 py-3 text-[10px] font-black uppercase shadow-xl shadow-brand-500/20"
            >
              {initialData ? 'Actualizar Empresa' : 'Crear Proveedor'}
            </LoadingButton>
          </div>
        </form>
      </div>
    </div>
  );
}
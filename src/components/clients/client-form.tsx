// src/components/clients/client-form.tsx
"use client";

import { createClientCompany, updateClientCompany, deleteClientCompany } from "@/lib/actions/clients";
import { useRouter } from "next/navigation";
import { useTransition, useState } from "react";
import ConfirmModal from "@/components/ui/confirm-modal";
import { toast } from "sonner";
import LoadingButton from "@/components/ui/loading-button";

interface ClientFormProps {
  initialData?: { id: string; name: string; isActive: boolean; };
}

export default function ClientForm({ initialData }: ClientFormProps) {
  const [isPending, startTransition] = useTransition();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  const clientAction = async (formData: FormData) => {
    startTransition(async () => {
      const result = initialData 
        ? await updateClientCompany(initialData.id, formData)
        : await createClientCompany(formData);

      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(initialData ? "Empresa actualizada" : "Empresa creada");
        if (!initialData) router.push("/dashboard/clients");
        router.refresh();
      }
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteClientCompany(initialData!.id);
      setIsModalOpen(false);
      
      if (result?.error) {
        toast.error(result.error);
      } else {
        if (result?.info) toast.info(result.info);
        else toast.success(result?.success || "Registro eliminado");
        
        router.push("/dashboard/clients");
        router.refresh();
      }
    });
  };

  return (
    <>
      <form 
        action={clientAction} 
        className="card-module space-y-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-8 rounded-2xl transition-colors duration-300"
      >
        <div className="space-y-6">
          {/* Nombre de la Empresa */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-[0.2em] mb-1 block">
              Nombre de la Empresa
            </label>
            <input 
              name="name" 
              defaultValue={initialData?.name} 
              required 
              placeholder="Ej: MetalTux Corp"
              className="form-input w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border-slate-200 dark:border-slate-700 focus:ring-brand-500 rounded-xl" 
              disabled={isPending} 
            />
          </div>

          {/* Switch/Checkbox de Estado */}
          {initialData && (
            <div className="flex items-center gap-4 p-5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-700 transition-colors group">
              <div className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  name="isActive" 
                  id="isActive" 
                  defaultChecked={initialData.isActive} 
                  className="w-5 h-5 text-brand-600 rounded-md border-slate-300 dark:border-slate-600 dark:bg-slate-700 focus:ring-brand-500 transition-all cursor-pointer" 
                />
              </div>
              <label htmlFor="isActive" className="flex flex-col cursor-pointer">
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200">Empresa Activa / Operativa</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">Permitir que los contactos de esta empresa abran tickets.</span>
              </label>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
          <LoadingButton 
            type="submit" 
            isLoading={isPending}
            loadingText={initialData ? "Guardando..." : "Creando..."}
            className="px-10 py-3 text-xs font-black uppercase tracking-widest rounded-xl"
          >
            {initialData ? "Actualizar Datos" : "Registrar Empresa"}
          </LoadingButton>
        </div>

        {/* Zona de peligro - Botón de eliminación */}
        {initialData && (
          <div className="mt-10 pt-6 border-t border-red-100 dark:border-red-900/20 flex flex-col items-center sm:items-start">
            <p className="text-[10px] font-black text-red-500/60 dark:text-red-400/40 uppercase tracking-widest mb-3">Zona de Peligro</p>
            <button 
              type="button" 
              onClick={() => setIsModalOpen(true)} 
              disabled={isPending}
              className="text-xs font-bold text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 underline underline-offset-8 decoration-red-500/30 hover:decoration-red-700 transition-all disabled:opacity-50"
            >
              Eliminar registro permanentemente
            </button>
          </div>
        )}
      </form>

      <ConfirmModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onConfirm={handleDelete} 
        isLoading={isPending} 
        variant="danger"
        title="¿Eliminar Empresa?" 
        description={`Estás a punto de eliminar a ${initialData?.name}. Si tiene tickets o contactos asociados, el sistema solo desactivará la cuenta para proteger la integridad del historial.`} 
      />
    </>
  );
}
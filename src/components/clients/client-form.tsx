// src/components/clients/client-form.tsx
"use client";

import { createClientCompany, updateClientCompany, deleteClientCompany } from "@/lib/actions/clients";
import { useRouter } from "next/navigation";
import { useTransition, useState } from "react";
import ConfirmModal from "@/components/ui/confirm-modal";
import { toast } from "sonner";

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

      if (result?.error) toast.error(result.error);
      else toast.success(initialData ? "Empresa actualizada" : "Empresa creada");
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteClientCompany(initialData!.id);
      setIsModalOpen(false);
      
      if (result?.error) toast.error(result.error);
      else {
        result?.info ? toast.info(result.info) : toast.success(result?.success);
        router.push("/dashboard/clients");
        router.refresh();
      }
    });
  };

  return (
    <>
      <form action={clientAction} className="card-module space-y-6">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold uppercase text-slate-500 mb-1 block">Nombre de la Empresa</label>
            <input name="name" defaultValue={initialData?.name} required className="form-input" disabled={isPending} />
          </div>

          {initialData && (
            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
              <input type="checkbox" name="isActive" id="isActive" defaultChecked={initialData.isActive} className="w-4 h-4 text-brand-600 rounded" />
              <label htmlFor="isActive" className="text-sm font-medium">Empresa Activa</label>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <button type="submit" disabled={isPending} className="btn-primary px-10">
            {isPending ? "Procesando..." : initialData ? "Actualizar" : "Crear Empresa"}
          </button>
        </div>

        {initialData && (
          <div className="mt-12 pt-6 border-t border-red-100 dark:border-red-900/30">
            <button type="button" onClick={() => setIsModalOpen(true)} className="text-xs font-bold text-red-500 hover:text-red-700 underline">
              Eliminar registro
            </button>
          </div>
        )}
      </form>
      <ConfirmModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onConfirm={handleDelete} 
        isLoading={isPending} 
        title="¿Eliminar Empresa?" 
        description={`Estás a punto de eliminar a ${initialData?.name}.`} 
      />
    </>
  );
}
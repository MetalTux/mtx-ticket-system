// src/components/clients/delete-client-button.tsx
"use client";

import { deleteClientCompany } from "@/lib/actions/clients";
import { Trash2 } from "lucide-react";
import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import ConfirmModal from "@/components/ui/confirm-modal";

export default function DeleteClientButton({ id, clientName }: { id: string, clientName: string }) {
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteClientCompany(id);
      setIsOpen(false);
      
      if (result?.error) {
        toast.error(result.error);
      } else {
        if (result?.info) {
          toast.info(result.info);
        } else {
          toast.success(result?.success || "Empresa eliminada correctamente");
        }
        router.refresh();
      }
    });
  };

  return (
    <>
      <button 
        onClick={(e) => {
          e.preventDefault(); // Evitamos navegación accidental si está dentro de un Link
          setIsOpen(true);
        }}
        disabled={isPending}
        className="p-2 bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-all group/btn"
        title="Eliminar empresa"
      >
        <Trash2 
          size={16} 
          className={`text-slate-400 group-hover/btn:text-red-500 transition-colors ${isPending ? "animate-spin" : ""}`} 
        />
      </button>

      <ConfirmModal 
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={handleDelete}
        isLoading={isPending}
        variant="danger"
        title="¿Eliminar Empresa?"
        description={`¿Estás seguro de que deseas eliminar a ${clientName}? Esta acción podría desactivar la cuenta si existen tickets asociados para mantener la integridad del historial.`}
      />
    </>
  );
}
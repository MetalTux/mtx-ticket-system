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
      
      if (result?.error) toast.error(result.error);
      else {
        result?.info ? toast.info(result.info) : toast.success(result?.success);
        router.refresh();
      }
    });
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        disabled={isPending}
        className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors group/btn"
      >
        <Trash2 size={16} className={`text-slate-400 group-hover/btn:text-red-500 ${isPending ? "animate-pulse" : ""}`} />
      </button>

      <ConfirmModal 
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={handleDelete}
        isLoading={isPending}
        title="¿Eliminar Empresa?"
        description={`¿Deseas eliminar a ${clientName}?`}
      />
    </>
  );
}
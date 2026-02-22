// src/components/contacts/delete-contact-button.tsx
"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { deleteContact } from "@/lib/actions/contacts";
import ConfirmModal from "@/components/ui/confirm-modal";
import { toast } from "sonner";

export default function DeleteContactButton({ id, name, clientId }: { id: string, name: string, clientId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteContact(id, clientId);
      
      setIsOpen(false);

      if (result?.success) {
        toast.success(result.success, {
          duration: 5000,
        });
        router.refresh();
      } else if (result?.error) {
        toast.error(result.error);
      }
    });
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={isPending}
        title="Eliminar contacto"
      >
        <Trash2 size={16} className={isPending ? "animate-spin" : ""} />
      </button>

      <ConfirmModal 
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={handleDelete}
        isLoading={isPending}
        variant="danger"
        title="¿Eliminar Contacto?"
        description={`¿Estás seguro de eliminar a ${name}? Si tiene tickets registrados, el sistema solo revocará su acceso (Desactivar) para mantener la integridad de los datos.`}
      />
    </>
  );
}
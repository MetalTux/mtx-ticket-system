// src/components/contacts/delete-contact-button.tsx
"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation"; // Importamos el router
import { deleteContact } from "@/lib/actions/contacts";
import ConfirmModal from "@/components/ui/confirm-modal";
import { toast } from "sonner";

export default function DeleteContactButton({ id, name, clientId }: { id: string, name: string, clientId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter(); // Inicializamos el router

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteContact(id, clientId);
      
      // Cerramos el modal
      setIsOpen(false);

      // FORZAMOS LA ACTUALIZACIÓN VISUAL
      // Esto hace que Next.js pida de nuevo los datos a la DB 
      // y refresque la lista de contactos sin recargar la página completa.
      router.refresh();

      // Si quieres mostrar un mensaje informativo podrías manejarlo aquí
      if (result?.success) {
        //alert(result.message); // O un toast más elegante
        toast.info(result.success, {
          duration: 5000,
        });
      }
    });
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-slate-400 hover:text-red-600 transition-colors"
        disabled={isPending}
      >
        <Trash2 size={16} className={isPending ? "animate-pulse" : ""} />
      </button>

      <ConfirmModal 
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={handleDelete}
        isLoading={isPending}
        title="¿Eliminar Contacto?"
        description={`¿Estás seguro de eliminar a ${name}? Si tiene tickets registrados, el sistema solo revocará su acceso (Desactivar).`}
      />
    </>
  );
}
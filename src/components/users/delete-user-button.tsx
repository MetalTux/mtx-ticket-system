// src/components/users/delete-user-button.tsx
"use client";

import { useState, useTransition } from "react";
import { Power } from "lucide-react";
import { useRouter } from "next/navigation";
import { deleteOrDeactivateUser } from "@/lib/actions/users";
import ConfirmModal from "@/components/ui/confirm-modal";
import { toast } from "sonner";

export default function DeleteUserButton({ id, name, isActive }: { id: string, name: string, isActive: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleAction = () => {
    startTransition(async () => {
      const result = await deleteOrDeactivateUser(id);
      setIsOpen(false);

      if (result?.success) {
        toast.success(result.success);
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
        className={`p-2 rounded-lg transition-all cursor-pointer disabled:cursor-not-allowed ${
          isActive 
            ? "text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20" 
            : "text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
        }`}
        disabled={isPending} // Quitamos !isActive para permitir reactivación si el botón lo soporta
        title={isActive ? "Desactivar Usuario" : "Reactivar Usuario"}
      >
        <Power size={18} className={isPending ? "animate-spin" : ""} />
      </button>

      <ConfirmModal 
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={handleAction}
        isLoading={isPending}
        variant={isActive ? "danger" : "success"} // Añadimos variante visual
        title={isActive ? "¿Dar de baja usuario?" : "¿Reactivar usuario?"}
        description={
          isActive 
          ? `¿Estás seguro de que deseas eliminar a ${name}? El sistema intentará eliminarlo o desactivar su acceso según su historial.`
          : `¿Deseas restaurar el acceso al sistema para ${name}?`
        }
      />
    </>
  );
}

// // src/components/users/delete-user-button.tsx
// "use client";

// import { useState, useTransition } from "react";
// import { Power } from "lucide-react";
// import { useRouter } from "next/navigation";
// import { deleteOrDeactivateUser } from "@/lib/actions/users";
// import ConfirmModal from "@/components/ui/confirm-modal";
// import { toast } from "sonner";

// export default function DeleteUserButton({ id, name, isActive }: { id: string, name: string, isActive: boolean }) {
//   const [isOpen, setIsOpen] = useState(false);
//   const [isPending, startTransition] = useTransition();
//   const router = useRouter();

//   const handleAction = () => {
//     startTransition(async () => {
//       const result = await deleteOrDeactivateUser(id);
//       setIsOpen(false);

//       if (result?.success) {
//         toast.success(result.success);
//         // router.refresh() le dice a Next.js que vuelva a ejecutar la consulta del server component
//         router.refresh(); 
//       } else if (result?.error) {
//         toast.error(result.error);
//       }
//     });
//   };

//   return (
//     <>
//       <button 
//         onClick={() => setIsOpen(true)}
//         // Añadimos cursor-pointer y manejamos el cursor cuando está deshabilitado
//         className={`p-2 rounded-lg transition-colors cursor-pointer disabled:cursor-not-allowed ${
//           isActive 
//             ? "text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20" 
//             : "text-red-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
//         }`}
//         disabled={isPending || !isActive}
//         title={isActive ? "Desactivar/Eliminar" : "Reactivar (en edición)"}
//       >
//         <Power size={18} className={isPending ? "animate-spin" : ""} />
//       </button>

//       <ConfirmModal 
//         isOpen={isOpen}
//         onClose={() => setIsOpen(false)}
//         onConfirm={handleAction}
//         isLoading={isPending}
//         title={isActive ? "¿Dar de baja usuario?" : "Confirmar acción"}
//         description={`¿Estás seguro de que deseas eliminar a ${name}? El sistema intentará eliminarlo o desactivar su acceso según su historial.`}
//       />
//     </>
//   );
// }
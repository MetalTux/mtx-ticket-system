// src/components/contacts/contact-form.tsx
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createContact, updateContact } from "@/lib/actions/contacts";
import { Building2, User as UserIcon, Mail, Lock, AlertCircle } from "lucide-react";
import { User as Contact } from "@prisma/client";
import { toast } from "sonner";

export default function ContactForm({ clientId, clientName, initialData }: { clientId: string, clientName: string, initialData?: Contact }) {
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();
  const isEditing = !!initialData;

  const handleAction = async (formData: FormData) => {
    setErrorMessage(null);
    startTransition(async () => {
      const result = isEditing 
        ? await updateContact(initialData.id, clientId, formData)
        : await createContact(clientId, formData);
      
      if (result?.error) {
        setErrorMessage(result.error);
        toast.error(result.error);
      } else {
        toast.success(isEditing ? "Cambios guardados" : "Contacto creado");
        router.push(`/dashboard/clients/${clientId}`);
        router.refresh();
      }
    });
  };

  return (
    <form action={handleAction} className="card-module space-y-4">
      {errorMessage && (
        <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
          <AlertCircle size={16} /> {errorMessage}
        </div>
      )}

      <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border">
        <Building2 className="text-slate-400" size={18} />
        <div>
          <p className="text-[10px] font-bold uppercase text-slate-500">Empresa</p>
          <p className="text-sm font-bold">{clientName}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input name="name" defaultValue={initialData?.name || ""} placeholder="Nombre" required className="form-input" disabled={isPending} />
        <input name="email" defaultValue={initialData?.email || ""} placeholder="Email" required className="form-input" disabled={isPending} />
      </div>

      <input name="password" type="password" placeholder={isEditing ? "Nueva contraseña (opcional)" : "Contraseña"} required={!isEditing} className="form-input" disabled={isPending} />

      {isEditing && (
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="isActive" defaultChecked={initialData.isActive} className="rounded" />
          Usuario activo
        </label>
      )}

      <div className="pt-4 flex justify-end">
        <button type="submit" disabled={isPending} className="btn-primary">
          {isPending ? "Guardando..." : isEditing ? "Actualizar" : "Crear"}
        </button>
      </div>
    </form>
  );
}
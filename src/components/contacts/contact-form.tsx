// src/components/contacts/contact-form.tsx
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createContact, updateContact } from "@/lib/actions/contacts";
import { Building2, AlertCircle, User, Lock, Mail } from "lucide-react"; // Iconos extra para pulir
import { User as Contact } from "@prisma/client";
import { toast } from "sonner";
import LoadingButton from "@/components/ui/loading-button";

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
    <form action={handleAction} className="card-module space-y-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-6 sm:p-8 rounded-2xl shadow-xl transition-colors">
      {errorMessage && (
        <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm border border-red-100 dark:border-red-900/30 animate-in fade-in slide-in-from-top-1">
          <AlertCircle size={18} /> 
          <span className="font-medium">{errorMessage}</span>
        </div>
      )}

      {/* Info de la Empresa (Read Only Look) */}
      <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700">
        <div className="p-2 bg-brand-100 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400 rounded-lg">
          <Building2 size={20} />
        </div>
        <div>
          <p className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-widest leading-none mb-1">Empresa Cliente</p>
          <p className="text-sm font-bold text-slate-900 dark:text-white leading-none">{clientName}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-widest">Nombre Completo</label>
          <div className="relative group">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors" size={16} />
            <input 
              name="name" 
              defaultValue={initialData?.name || ""} 
              placeholder="Juan Pérez" 
              required 
              className="form-input w-full pl-10 dark:bg-slate-800 dark:border-slate-700 dark:text-white" 
              disabled={isPending} 
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-widest">Correo Electrónico</label>
          <div className="relative group">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors" size={16} />
            <input 
              name="email" 
              type="email"
              defaultValue={initialData?.email || ""} 
              placeholder="usuario@empresa.com" 
              required 
              className="form-input w-full pl-10 dark:bg-slate-800 dark:border-slate-700 dark:text-white" 
              disabled={isPending} 
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-widest">
          {isEditing ? "Actualizar Contraseña" : "Contraseña de Acceso"}
        </label>
        <div className="relative group">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors" size={16} />
          <input 
            name="password" 
            type="password" 
            placeholder={isEditing ? "Dejar en blanco para mantener actual" : "Mínimo 6 caracteres"} 
            required={!isEditing} 
            className="form-input w-full pl-10 dark:bg-slate-800 dark:border-slate-700 dark:text-white" 
            disabled={isPending} 
          />
        </div>
      </div>

      {isEditing && (
        <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-700 flex items-center gap-3 group cursor-pointer transition-colors hover:bg-slate-100 dark:hover:bg-slate-800/60">
          <input 
            type="checkbox" 
            name="isActive" 
            id="isActive"
            defaultChecked={initialData.isActive} 
            className="w-4 h-4 text-brand-600 rounded border-slate-300 dark:border-slate-700 dark:bg-slate-800 focus:ring-brand-500" 
          />
          <label htmlFor="isActive" className="text-sm font-bold text-slate-700 dark:text-slate-300 cursor-pointer select-none">
            Usuario con acceso activo al sistema
          </label>
        </div>
      )}

      <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
        <LoadingButton 
          type="submit" 
          isLoading={isPending} 
          loadingText={isEditing ? "Guardando..." : "Creando..."}
          className="px-10 py-3 text-xs font-black uppercase tracking-widest rounded-xl"
        >
          {isEditing ? "Actualizar Contacto" : "Registrar Contacto"}
        </LoadingButton>
      </div>
    </form>
  );
}
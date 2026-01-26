// src/components/users/user-form.tsx
"use client";

import { createStaffUser, updateStaffUser } from "@/lib/actions/users";
import { Role, User } from "@prisma/client";
import { useRouter } from "next/navigation";
import { ArrowLeft, UserPlus, UserCog } from "lucide-react";

interface UserStaffFormProps {
  initialData?: User | null; // Si viene, estamos editando
}

export default function UserStaffForm({ initialData }: UserStaffFormProps) {
  const router = useRouter();
  const STAFF_ROLES = [Role.ADMIN, Role.SOPORTE, Role.DESARROLLO, Role.VENTAS];
  
  // Decidimos qué acción ejecutar
  const formAction = initialData 
    ? updateStaffUser.bind(null, initialData.id) 
    : createStaffUser;

  return (
    <div className="space-y-4">
      <button 
        type="button"
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-brand-600 transition-colors"
      >
        <ArrowLeft size={16} />
        Volver al listado
      </button>

      <form action={formAction} className="card-module space-y-6 shadow-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            {initialData ? <UserCog className="text-brand-500" size={20} /> : <UserPlus className="text-brand-600" size={20} />}
            {initialData ? `Editando a ${initialData.name}` : "Nuevo Integrante del Equipo"}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {initialData ? "Modifica el rol o datos del usuario." : "Registro de personal interno de la Empresa Proveedora."}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Nombre Completo</label>
            <input name="name" type="text" required defaultValue={initialData?.name || ""} className="form-input w-full" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Email Corporativo</label>
            <input name="email" type="email" required defaultValue={initialData?.email || ""} className="form-input w-full" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Contraseña {initialData && "(Dejar vacío para no cambiar)"}
            </label>
            <input name="password" type="password" required={!initialData} className="form-input w-full" placeholder="••••••••" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Rol de Sistema</label>
            <select name="role" className="form-input w-full" required defaultValue={initialData?.role || Role.SOPORTE}>
              {STAFF_ROLES.map((role) => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>
        </div>

        {initialData && (
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="isActive" defaultChecked={initialData.isActive} className="rounded" />
            Usuario activo
          </label>
        )}

        <button type="submit" className="btn-primary w-full py-4 text-base font-black uppercase tracking-widest">
          {initialData ? "Guardar Cambios" : "Registrar Usuario"}
        </button>
      </form>
    </div>
  );
}
// src/components/users/user-form.tsx
"use client";

import { createStaffUser, updateStaffUser } from "@/lib/actions/users";
import { Role, User } from "@prisma/client";
import { useRouter } from "next/navigation";
import { ArrowLeft, UserPlus, UserCog, CheckCircle2, AlertCircle } from "lucide-react";
import LoadingButton from "@/components/ui/loading-button";

interface UserStaffFormProps {
  initialData?: User | null;
}

export default function UserStaffForm({ initialData }: UserStaffFormProps) {
  const router = useRouter();
  const STAFF_ROLES = [Role.ADMIN, Role.SOPORTE, Role.DESARROLLO, Role.VENTAS];
  
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

      <form action={formAction} className="card-module space-y-6 shadow-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            {initialData ? <UserCog className="text-brand-500" size={20} /> : <UserPlus className="text-brand-600" size={20} />}
            {initialData ? `Editando a ${initialData.name}` : "Nuevo Integrante del Equipo"}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {initialData ? "Modifica los permisos o datos del usuario." : "Registro de personal interno de la Empresa Proveedora."}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Nombre Completo</label>
            <input name="name" type="text" required defaultValue={initialData?.name || ""} className="form-input w-full dark:bg-slate-800 dark:border-slate-700 dark:text-white" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Email Corporativo</label>
            <input name="email" type="email" required defaultValue={initialData?.email || ""} className="form-input w-full dark:bg-slate-800 dark:border-slate-700 dark:text-white" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Contraseña {initialData && "(Dejar vacío para no cambiar)"}
            </label>
            <input name="password" type="password" required={!initialData} className="form-input w-full dark:bg-slate-800 dark:border-slate-700 dark:text-white" placeholder="••••••••" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Rol de Sistema</label>
            <select name="role" className="form-input w-full dark:bg-slate-800 dark:border-slate-700 dark:text-white" required defaultValue={initialData?.role || Role.SOPORTE}>
              {STAFF_ROLES.map((role) => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>
        </div>

        {initialData && (
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between transition-colors">
            <div className="flex items-center gap-3">
              {initialData.isActive ? (
                <CheckCircle2 className="text-emerald-500" size={24} />
              ) : (
                <AlertCircle className="text-red-500" size={24} />
              )}
              <div>
                <p className="text-sm font-bold text-slate-800 dark:text-white">Estado de la cuenta</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {initialData.isActive ? "El usuario puede acceder al sistema." : "El acceso está bloqueado actualmente."}
                </p>
              </div>
            </div>
            
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                name="isActive" 
                defaultChecked={initialData.isActive} 
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-brand-600"></div>
            </label>
          </div>
        )}

        <LoadingButton 
          type="submit" 
          loadingText={initialData ? "Guardando..." : "Registrando..."}
          className="w-full py-4 text-base font-black uppercase tracking-widest shadow-lg shadow-brand-500/10"
        >
          {initialData ? "Guardar Cambios de Usuario" : "Registrar Integrante Staff"}
        </LoadingButton>
      </form>
    </div>
  );
}
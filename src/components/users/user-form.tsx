// src/components/users/user-form.tsx
"use client";

import { useActionState, useState } from "react";
import { createStaffUser, updateStaffUser, type UserActionState } from "@/lib/actions/users";
import { Role, User, TicketCategory } from "@prisma/client";
import { useRouter } from "next/navigation";
import { ArrowLeft, UserPlus, UserCog, CheckCircle2, AlertCircle, Tags } from "lucide-react";
import LoadingButton from "@/components/ui/loading-button";

// Extendemos el tipo de usuario inicial para incluir las categorías permitidas
type UserWithCategories = User & {
  allowedCategories?: { id: string }[];
};

interface UserStaffFormProps {
  initialData?: UserWithCategories | null;
  categories: TicketCategory[]; 
}

export default function UserStaffForm({ initialData, categories }: UserStaffFormProps) {
  const router = useRouter();
  const STAFF_ROLES = [Role.ADMIN, Role.SOPORTE, Role.DESARROLLO, Role.VENTAS];
  
  // ESTADO NUEVO: Para saber qué rol está seleccionado en tiempo real
  const [selectedRole, setSelectedRole] = useState<string>(initialData?.role || Role.SOPORTE);
  
  const defaultCategoryIds = initialData?.allowedCategories?.map(c => c.id) || [];

  const actionToRun: (prevState: UserActionState, formData: FormData) => Promise<UserActionState> = 
    initialData 
      ? updateStaffUser.bind(null, initialData.id) 
      : createStaffUser;

  const [state, formAction, isPending] = useActionState(actionToRun, null);

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

      {state?.message && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-bold animate-in fade-in">
          <AlertCircle size={18} />
          {state.message}
        </div>
      )}

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
            <input 
              name="name" 
              type="text" 
              required 
              defaultValue={initialData?.name || ""} 
              className={`form-input w-full dark:bg-slate-800 dark:border-slate-700 dark:text-white ${state?.errors?.name ? 'border-red-500' : ''}`} 
            />
            {state?.errors?.name && <p className="text-[10px] text-red-500 font-bold">{state.errors.name[0]}</p>}
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Email Corporativo</label>
            <input 
              name="email" 
              type="email" 
              required 
              defaultValue={initialData?.email || ""} 
              className={`form-input w-full dark:bg-slate-800 dark:border-slate-700 dark:text-white ${state?.errors?.email ? 'border-red-500' : ''}`} 
            />
            {state?.errors?.email && <p className="text-[10px] text-red-500 font-bold">{state.errors.email[0]}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Contraseña {initialData && "(Dejar vacío para no cambiar)"}
            </label>
            <input 
              name="password" 
              type="password" 
              required={!initialData} 
              className={`form-input w-full dark:bg-slate-800 dark:border-slate-700 dark:text-white ${state?.errors?.password ? 'border-red-500' : ''}`} 
              placeholder="••••••••" 
            />
            {state?.errors?.password && <p className="text-[10px] text-red-500 font-bold">{state.errors.password[0]}</p>}
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Rol de Sistema</label>
            <select 
              name="role" 
              className="form-input w-full dark:bg-slate-800 dark:border-slate-700 dark:text-white" 
              required 
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
            >
              {STAFF_ROLES.map((role) => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
            {state?.errors?.role && <p className="text-[10px] text-red-500 font-bold">{state.errors.role[0]}</p>}
          </div>
        </div>

        {/* LÓGICA CONDICIONAL: Solo mostrar si NO es ADMIN */}
        {selectedRole !== Role.ADMIN ? (
          <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400">
              <Tags size={16} />
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-300">
                Categorías de Tickets Permitidas
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Selecciona a qué categorías de requerimientos puede acceder este usuario. Si no marcas ninguna, solo verá los tickets que él cree o se le asignen directamente.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {categories.map((category) => (
                <label 
                  key={category.id} 
                  className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer hover:border-brand-500/50 transition-colors group"
                >
                  <input 
                    type="checkbox" 
                    name="allowedCategories"
                    value={category.id}
                    defaultChecked={defaultCategoryIds.includes(category.id)}
                    className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                  />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200 group-hover:text-brand-600 transition-colors">
                    {category.name}
                  </span>
                </label>
              ))}
            </div>
          </div>
        ) : (
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 animate-in fade-in">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
              🛡️ El rol de Administrador tiene acceso global a todas las categorías del sistema por defecto.
            </p>
          </div>
        )}

        {initialData && (
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between transition-colors mt-6">
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

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
          <LoadingButton 
            type="submit" 
            isLoading={isPending}
            loadingText={initialData ? "Guardando..." : "Registrando..."}
            className="w-full py-4 text-base font-black uppercase tracking-widest shadow-lg shadow-brand-500/10"
          >
            {initialData ? "Guardar Cambios de Usuario" : "Registrar Integrante Staff"}
          </LoadingButton>
        </div>
      </form>
    </div>
  );
}
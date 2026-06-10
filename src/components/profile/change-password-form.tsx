// src/components/profile/change-password-form.tsx
"use client";

import { useActionState, useEffect, useRef } from "react";
import { changePassword, type ProfileActionState } from "@/lib/actions/profile";
import { Lock, AlertCircle, CheckCircle2 } from "lucide-react";
import LoadingButton from "@/components/ui/loading-button";
import { toast } from "sonner";

export default function ChangePasswordForm() {
  const [state, formAction, isPending] = useActionState<ProfileActionState, FormData>(
    changePassword,
    null
  );
  
  const formRef = useRef<HTMLFormElement>(null);

  // Si fue exitoso, reseteamos el formulario visualmente y mostramos el toast
  useEffect(() => {
    if (state?.success) {
      toast.success(state.message);
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="card-module border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm space-y-6">
      
      <div className="flex items-center gap-2 mb-2">
        <Lock size={20} className="text-brand-600 dark:text-brand-400" />
        <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
          Cambiar Contraseña
        </h2>
      </div>

      {state?.message && !state.success && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs font-bold animate-in fade-in">
          <AlertCircle size={18} />
          {state.message}
        </div>
      )}

      {state?.success && (
        <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-600 text-xs font-bold animate-in fade-in">
          <CheckCircle2 size={18} />
          {state.message}
        </div>
      )}

      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 ml-1">
            Contraseña Actual
          </label>
          <input 
            name="currentPassword" 
            type="password" 
            required 
            placeholder="••••••••"
            className={`form-input w-full px-4 py-3 dark:bg-slate-800/50 dark:border-slate-700 dark:text-white ${state?.errors?.currentPassword ? 'border-red-500' : ''}`} 
          />
          {state?.errors?.currentPassword && (
            <p className="text-[10px] text-red-500 font-bold mt-1 ml-1">{state.errors.currentPassword[0]}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 ml-1">
              Nueva Contraseña
            </label>
            <input 
              name="newPassword" 
              type="password" 
              required 
              placeholder="••••••••"
              className={`form-input w-full px-4 py-3 dark:bg-slate-800/50 dark:border-slate-700 dark:text-white ${state?.errors?.newPassword ? 'border-red-500' : ''}`} 
            />
            {state?.errors?.newPassword && (
              <p className="text-[10px] text-red-500 font-bold mt-1 ml-1">{state.errors.newPassword[0]}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 ml-1">
              Confirmar Nueva
            </label>
            <input 
              name="confirmPassword" 
              type="password" 
              required 
              placeholder="••••••••"
              className={`form-input w-full px-4 py-3 dark:bg-slate-800/50 dark:border-slate-700 dark:text-white ${state?.errors?.confirmPassword ? 'border-red-500' : ''}`} 
            />
            {state?.errors?.confirmPassword && (
              <p className="text-[10px] text-red-500 font-bold mt-1 ml-1">{state.errors.confirmPassword[0]}</p>
            )}
          </div>
        </div>
      </div>

      <div className="pt-2">
        <LoadingButton 
          type="submit" 
          isLoading={isPending}
          loadingText="Actualizando..."
          className="w-full sm:w-auto px-8 py-3 text-xs font-black uppercase tracking-widest"
        >
          Actualizar Contraseña
        </LoadingButton>
      </div>
    </form>
  );
}
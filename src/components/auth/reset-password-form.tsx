// src/components/auth/reset-password-form.tsx
"use client";

import { useActionState } from "react";
import { executePasswordReset, type AuthActionState } from "@/lib/actions/auth";
import Link from "next/link";
import { Lock, AlertCircle, ArrowRight } from "lucide-react";
import LoadingButton from "@/components/ui/loading-button";

interface ResetPasswordFormProps {
  token: string;
}

export default function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  // Atamos el token a la acción para que el servidor sepa a quién le pertenece
  const actionWithToken = executePasswordReset.bind(null, token);
  
  const [state, formAction, isPending] = useActionState<AuthActionState, FormData>(
    actionWithToken,
    null
  );

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <form action={formAction} className="card-module space-y-6 shadow-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 lg:p-8 rounded-2xl transition-colors">
        <div className="space-y-1">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Crea una nueva contraseña
          </h2>
          <p className="text-xs lg:text-sm text-slate-500 dark:text-slate-400 font-medium">
            Asegúrate de que tenga al menos 8 caracteres. Te recomendamos usar números y símbolos.
          </p>
        </div>

        {state?.message && !state.success && (
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs font-bold animate-in fade-in">
            <AlertCircle size={18} />
            {state.message}
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Nueva Contraseña
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Lock size={16} />
              </span>
              <input 
                name="password" 
                type="password" 
                required 
                placeholder="••••••••"
                className={`form-input w-full pl-10 dark:bg-slate-800 dark:border-slate-700 dark:text-white ${state?.errors?.password ? 'border-red-500' : ''}`} 
              />
            </div>
            {state?.errors?.password && (
              <p className="text-[10px] text-red-500 font-bold mt-1">{state.errors.password[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Confirmar Contraseña
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Lock size={16} />
              </span>
              <input 
                name="confirmPassword" 
                type="password" 
                required 
                placeholder="••••••••"
                className={`form-input w-full pl-10 dark:bg-slate-800 dark:border-slate-700 dark:text-white ${state?.errors?.confirmPassword ? 'border-red-500' : ''}`} 
              />
            </div>
            {state?.errors?.confirmPassword && (
              <p className="text-[10px] text-red-500 font-bold mt-1">{state.errors.confirmPassword[0]}</p>
            )}
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <LoadingButton 
            type="submit" 
            isLoading={isPending}
            loadingText="Guardando..."
            className="w-full py-4 text-sm font-black uppercase tracking-widest shadow-lg shadow-brand-500/10"
          >
            Guardar y Entrar
          </LoadingButton>

          <div className="text-center pt-2">
            <Link 
              href="/auth/login" 
              className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-brand-600 transition-colors"
            >
              Cancelar y volver <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}
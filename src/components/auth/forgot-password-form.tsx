// src/components/auth/forgot-password-form.tsx
"use client";

import { useActionState } from "react";
import { requestPasswordReset, type AuthActionState } from "@/lib/actions/auth";
import Link from "next/link";
import { Mail, ArrowLeft, AlertCircle, CheckCircle2 } from "lucide-react";
import LoadingButton from "@/components/ui/loading-button";

export default function ForgotPasswordForm() {
  const [state, formAction, isPending] = useActionState<AuthActionState, FormData>(
    requestPasswordReset,
    null
  );

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      {/* Mensaje de Éxito */}
      {state?.success ? (
        <div className="card-module bg-emerald-50/50 dark:bg-emerald-950/10 border-emerald-200 dark:border-emerald-900/30 p-6 rounded-2xl shadow-xl text-center space-y-4 animate-in fade-in zoom-in-95">
          <div className="mx-auto w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center">
            <CheckCircle2 size={24} />
          </div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">¡Enlace Enviado!</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            {state.message}
          </p>
          <div className="pt-2">
            <Link 
              href="/auth/login" 
              className="text-xs font-black uppercase tracking-widest text-brand-600 dark:text-brand-400 hover:underline"
            >
              Volver al Inicio de Sesión
            </Link>
          </div>
        </div>
      ) : (
        /* Formulario de Captura */
        <form action={formAction} className="card-module space-y-6 shadow-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 lg:p-8 rounded-2xl transition-colors">
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              ¿Olvidaste tu contraseña?
            </h2>
            <p className="text-xs lg:text-sm text-slate-500 dark:text-slate-400 font-medium">
              Introduce tu correo corporativo y te enviaremos un enlace seguro para restablecerla.
            </p>
          </div>

          {state?.message && !state.success && (
            <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs font-bold animate-in fade-in">
              <AlertCircle size={18} />
              {state.message}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Correo Electrónico
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Mail size={16} />
              </span>
              <input 
                name="email" 
                type="email" 
                required 
                placeholder="nombre@empresa.com"
                className={`form-input w-full pl-10 dark:bg-slate-800 dark:border-slate-700 dark:text-white ${state?.errors?.email ? 'border-red-500' : ''}`} 
              />
            </div>
            {state?.errors?.email && (
              <p className="text-[10px] text-red-500 font-bold mt-1">{state.errors.email[0]}</p>
            )}
          </div>

          <div className="space-y-4 pt-2">
            <LoadingButton 
              type="submit" 
              isLoading={isPending}
              loadingText="Enviando enlace..."
              className="w-full py-4 text-sm font-black uppercase tracking-widest shadow-lg shadow-brand-500/10"
            >
              Enviar Enlace de Recuperación
            </LoadingButton>

            <Link 
              href="/auth/login" 
              className="flex items-center justify-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-brand-600 transition-colors py-2"
            >
              <ArrowLeft size={14} />
              Volver al inicio de sesión
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}
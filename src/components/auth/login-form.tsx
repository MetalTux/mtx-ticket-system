// src/components/auth/login-form.tsx
"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { ShieldCheck, ArrowLeft } from "lucide-react";
import LoadingButton from "@/components/ui/loading-button";

export default function LoginForm() {
  // Estados para credenciales básicas
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // NUEVOS: Estados para el 2FA
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState("");
  
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("reset") === "success") {
      toast.success("Contraseña actualizada con éxito. Ya puedes iniciar sesión.");
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Si estamos en la pantalla de 2FA y no ha puesto los 6 números, detenemos
    if (showTwoFactor && twoFactorCode.length !== 6) {
      setError("Por favor, ingresa los 6 dígitos completos.");
      setLoading(false);
      return;
    }

    try {
      const result = await signIn("credentials", {
        email,
        password,
        // Mandamos el código solo si el formulario de 2FA está visible
        twoFactorToken: showTwoFactor ? twoFactorCode : "",
        redirect: false,
      });

      if (result?.error) {
        // INTERCEPTAMOS LOS ERRORES SECRETOS DE NEXTAUTH
        if (result.error === "2FA_REQUIRED" || result.code === "2FA_REQUIRED") {
          setShowTwoFactor(true);
          setLoading(false);
          return;
        }

        if (result.error === "2FA_INVALID" || result.code === "2FA_INVALID") {
          setError("El código de verificación es incorrecto o ha expirado.");
          setTwoFactorCode(""); // Limpiamos el campo
          setLoading(false);
          return;
        }

        // Si es un error normal (clave mala)
        setError("Credenciales inválidas. Por favor, reintenta.");
        toast.error("Error de acceso");
        setLoading(false);
      } else {
        toast.success("Acceso concedido");
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      toast.error("Error inesperado en el servidor");
      setError("Ocurrió un error inesperado.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 p-3 rounded-xl text-xs font-bold border border-red-100 dark:border-red-900/20 transition-all animate-in fade-in zoom-in-95">
          {error}
        </div>
      )}
      
      {searchParams.get("reset") === "success" && !error && (
        <div className="bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 dark:text-emerald-400 p-3 rounded-xl text-xs font-bold border border-emerald-100 dark:border-emerald-900/20 transition-all animate-in fade-in zoom-in-95">
          Tu contraseña ha sido actualizada. Ingresa tus nuevas credenciales.
        </div>
      )}

      {/* RENDERIZADO CONDICIONAL: Si mostramos el 2FA o los inputs normales */}
      {showTwoFactor ? (
        <div className="space-y-4 animate-in slide-in-from-right-4 fade-in duration-300">
          <div className="flex flex-col items-center justify-center space-y-2 pb-2">
            <div className="w-12 h-12 bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 rounded-full flex items-center justify-center mb-2">
              <ShieldCheck size={24} />
            </div>
            <p className="text-xs text-center text-slate-500 dark:text-slate-400 font-medium">
              Abre tu aplicación de autenticación e ingresa el código de 6 dígitos para continuar.
            </p>
          </div>

          <div className="space-y-1.5">
            <input
              type="text"
              maxLength={6}
              autoFocus
              className="block w-full px-4 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-300 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:outline-none text-center font-mono text-3xl font-black tracking-[0.5em] transition-all"
              value={twoFactorCode}
              onChange={(e) => setTwoFactorCode(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="000000"
              disabled={loading}
            />
          </div>

          <div className="pt-2">
            <LoadingButton 
              type="submit" 
              className="w-full py-4 text-xs font-black uppercase tracking-[0.2em] shadow-lg shadow-brand-500/20 rounded-xl" 
              loadingText="Verificando..."
              isLoading={loading}
              disabled={twoFactorCode.length !== 6}
            >
              Confirmar Identidad
            </LoadingButton>
            
            <button
              type="button"
              onClick={() => {
                setShowTwoFactor(false);
                setTwoFactorCode("");
                setError(null);
              }}
              className="w-full mt-3 py-2 flex items-center justify-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
              disabled={loading}
            >
              <ArrowLeft size={14} /> Volver y cambiar cuenta
            </button>
          </div>
        </div>
      ) : (
        /* FORMULARIO TRADICIONAL */
        <div className="space-y-5 animate-in slide-in-from-left-4 fade-in duration-300">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 ml-1">
              Correo Electrónico
            </label>
            <input
              type="email"
              required
              className="block w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:outline-none text-sm transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ej: usuario@correo.com"
              disabled={loading}
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between ml-1 pr-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                Contraseña
              </label>
              <Link 
                href="/auth/forgot-password" 
                className="text-[10px] font-bold text-brand-600 dark:text-brand-400 hover:text-brand-500 hover:underline transition-all"
                tabIndex={-1}
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
            <input
              type="password"
              required
              className="block w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:outline-none text-sm transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={loading}
            />
          </div>

          <div className="pt-2">
            <LoadingButton 
              type="submit" 
              className="w-full py-4 text-xs font-black uppercase tracking-[0.2em] shadow-lg shadow-brand-500/20 rounded-xl" 
              loadingText="Verificando..."
              isLoading={loading}
            >
              Iniciar Sesión
            </LoadingButton>
          </div>
        </div>
      )}
    </form>
  );
}
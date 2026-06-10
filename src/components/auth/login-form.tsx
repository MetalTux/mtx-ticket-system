// src/components/auth/login-form.tsx
"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import LoadingButton from "@/components/ui/loading-button";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Revisamos si el usuario viene de cambiar su contraseña exitosamente
  useEffect(() => {
    if (searchParams.get("reset") === "success") {
      toast.success("Contraseña actualizada con éxito. Ya puedes iniciar sesión.");
      
      // Limpiamos la URL silenciosamente para que no se repita el Toast al recargar o por el Strict Mode
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
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
      {/* Banner de error */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 p-3 rounded-xl text-xs font-bold border border-red-100 dark:border-red-900/20 transition-all animate-in fade-in zoom-in-95">
          {error}
        </div>
      )}
      
      {/* Banner de éxito al resetear contraseña */}
      {searchParams.get("reset") === "success" && !error && (
        <div className="bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 dark:text-emerald-400 p-3 rounded-xl text-xs font-bold border border-emerald-100 dark:border-emerald-900/20 transition-all animate-in fade-in zoom-in-95">
          Tu contraseña ha sido actualizada. Ingresa tus nuevas credenciales.
        </div>
      )}
      
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
        {/* Aquí hicimos el cambio: un flexbox para poner el label y el link en la misma línea */}
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
    </form>
  );
}
// src/components/auth/login-form.tsx
"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner"; // Opcional, pero consistente con tu App
import LoadingButton from "@/components/ui/loading-button";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

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
        toast.success("¡Bienvenido!");
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      toast.error("Ocurrió un error inesperado.");
      setError("Ocurrió un error inesperado.");
      setLoading(false);
    } finally {
      //setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm border border-red-100 dark:border-red-900/30 transition-colors">
          {error}
        </div>
      )}
      
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors">
          Correo Electrónico
        </label>
        <input
          type="email"
          required
          className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md shadow-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent sm:text-sm transition-all"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin@serviciosit.com"
          disabled={loading}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors">
          Contraseña
        </label>
        <input
          type="password"
          required
          className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md shadow-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent sm:text-sm transition-all"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          disabled={loading}
        />
      </div>

      <LoadingButton 
        type="submit" 
        className="w-full py-3" 
        loadingText="Validando credenciales..."
        isLoading={loading} // Pasamos el estado manual aquí
      >
        Iniciar Sesión
      </LoadingButton>

      {/* <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900 focus:ring-brand-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {loading ? "Verificando..." : "Iniciar Sesión"}
      </button> */}
    </form>
  );
}
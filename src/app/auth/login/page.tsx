// src/app/auth/login/page.tsx
import LoginForm from "@/components/auth/login-form";
import { Suspense } from "react";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 py-12 transition-colors duration-500">
      <div className="w-full max-w-md">
        {/* Card Principal con soporte Dark Mode optimizado */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-xl dark:shadow-2xl dark:shadow-black/50 border border-slate-100 dark:border-slate-800 transition-colors duration-500">
          <div className="text-center mb-8">
            {/* Logo o Título */}
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">
              MTX <span className="text-brand-600 dark:text-brand-500">Ticket</span> System
            </h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 font-medium">
              Bienvenido de nuevo. Por favor, ingresa tus credenciales.
            </p>
          </div>

          <Suspense 
            fallback={
              <div className="flex flex-col items-center justify-center py-8 space-y-4">
                <div className="w-8 h-8 border-4 border-slate-200 border-t-brand-600 rounded-full animate-spin" />
                <p className="text-sm text-slate-500 dark:text-slate-400">Cargando formulario...</p>
              </div>
            }
          >
            <LoginForm />
          </Suspense>

          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 dark:text-slate-500">
              Soporte Técnico Especializado
            </p>
          </div>
        </div>

        <footer className="mt-8 text-center text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-500 font-medium">
          &copy; {new Date().getFullYear()} MetalTux. Todos los derechos reservados.
        </footer>
      </div>
    </main>
  );
}
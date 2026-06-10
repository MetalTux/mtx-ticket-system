// src/app/auth/reset-password/page.tsx
import ResetPasswordForm from "@/components/auth/reset-password-form";
import Link from "next/link";
import { AlertCircle } from "lucide-react";

export const metadata = {
  title: "Restablecer Contraseña - GTSoft",
  description: "Crea una nueva contraseña para tu cuenta.",
};

interface Props {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ResetPasswordPage({ searchParams }: Props) {
  const params = await searchParams;
  const token = params.token as string | undefined;

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 py-12 sm:px-6 lg:px-8 transition-colors duration-300">
      {!token ? (
        <div className="w-full max-w-md mx-auto card-module bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-8 rounded-2xl shadow-xl text-center space-y-4">
          <div className="mx-auto w-12 h-12 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center">
            <AlertCircle size={24} />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Enlace Inválido</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Falta el código de seguridad. Por favor, asegúrate de haber copiado el enlace completo que te enviamos por correo.
          </p>
          <div className="pt-4">
            <Link href="/auth/forgot-password" className="btn-primary w-full py-3 inline-block">
              Solicitar nuevo enlace
            </Link>
          </div>
        </div>
      ) : (
        <ResetPasswordForm token={token} />
      )}
    </div>
  );
}
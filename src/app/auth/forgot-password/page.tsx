// src/app/auth/forgot-password/page.tsx
import ForgotPasswordForm from "@/components/auth/forgot-password-form";

export const metadata = {
  title: "Recuperar Contraseña - GTSoft",
  description: "Solicita un restablecimiento seguro de tu cuenta.",
};

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 py-12 sm:px-6 lg:px-8 transition-colors duration-300">
      <ForgotPasswordForm />
    </div>
  );
}
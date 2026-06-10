// src/app/dashboard/profile/page.tsx
import { auth } from "@/auth";
import db from "@/lib/db";
import { redirect } from "next/navigation";
import { User, ShieldCheck, Mail, Building2, BadgeCheck } from "lucide-react";
import TwoFactorSetup from "@/components/auth/two-factor-setup";
import ChangePasswordForm from "@/components/profile/change-password-form";

export const metadata = {
  title: "Mi Perfil - GTSoft",
};

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  // Buscamos los datos frescos del usuario en la base de datos
  const dbUser = await db.user.findUnique({
    where: { id: session.user.id },
    include: {
      client: true, // Por si es un cliente, mostrar su empresa
    }
  });

  if (!dbUser) {
    redirect("/auth/login");
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-8">
      {/* Cabecera */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 rounded-2xl">
          <User size={28} />
        </div>
        <div>
          <h1 className="text-2xl lg:text-3xl font-black text-slate-900 dark:text-white tracking-tighter">
            Mi Perfil
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">
            Gestiona tu información personal y la seguridad de tu cuenta.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Columna Izquierda: Datos Personales */}
        <div className="md:col-span-5 space-y-6">
          <div className="card-module bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-6">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-4">
              Información de la Cuenta
            </h3>
            
            <div className="space-y-4">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                  <User size={12} /> Nombre Completo
                </span>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  {dbUser.name}
                </span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                  <Mail size={12} /> Correo Electrónico
                </span>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  {dbUser.email}
                </span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                  <BadgeCheck size={12} /> Nivel de Acceso
                </span>
                <span className="text-xs font-black px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded inline-block w-max uppercase">
                  {dbUser.role.replace("_", " ")}
                </span>
              </div>

              {dbUser.client && (
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                    <Building2 size={12} /> Empresa
                  </span>
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    {dbUser.client.name}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Columna Derecha: Seguridad y 2FA */}
        <div className="md:col-span-7 space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck size={20} className="text-brand-600 dark:text-brand-400" />
            <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
              Seguridad
            </h2>
          </div>
          
          {/* Aquí inyectamos el componente que creamos hace un momento */}
          <TwoFactorSetup isAlreadyEnabled={dbUser.isTwoFactorEnabled} />

          {/* NUEVO: Formulario de cambio de contraseña */}
          <ChangePasswordForm />

        </div>
      </div>
    </div>
  );
}
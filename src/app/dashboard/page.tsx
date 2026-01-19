// src/app/dashboard/page.tsx

import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();

  // Guardrail: Si por alguna razón el middleware falla, 
  // este check protege el componente
  if (!session) {
    redirect("/auth/login");
  }

  const user = session.user;

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Header del Dashboard */}
          <div className="bg-blue-600 p-6 text-white flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold">Panel de Control</h1>
              <p className="text-blue-100 text-sm">Sistema de Tickets MTX</p>
            </div>
            
            <form action={async () => {
              "use server";
              await signOut();
            }}>
              <button className="bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded-lg text-sm transition-colors">
                Cerrar Sesión
              </button>
            </form>
          </div>

          {/* Contenido de Identidad */}
          <div className="p-8">
            <h2 className="text-2xl font-semibold text-slate-800">
              Bienvenido, {user.name}
            </h2>
            
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-xs font-bold uppercase text-slate-400">Rol de Usuario</span>
                <p className="text-lg font-medium text-blue-600">{user.role}</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-xs font-bold uppercase text-slate-400">Pertenencia</span>
                <p className="text-lg font-medium text-slate-700">
                  {user.providerId ? "🏢 Empresa de Atención (Proveedor)" : ""}
                  {user.clientId ? "👤 Usuario de Cliente Corporativo" : ""}
                </p>
              </div>
            </div>

            {/* Mensaje de Control de Acceso */}
            <div className="mt-8 p-4 border-l-4 border-amber-400 bg-amber-50 text-amber-800 text-sm">
              {user.role === 'ADMIN' ? (
                <p>Tienes acceso total para gestionar empresas, usuarios y tickets de soporte.</p>
              ) : (
                <p>Tu acceso está limitado a la creación y seguimiento de tickets de tu empresa.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
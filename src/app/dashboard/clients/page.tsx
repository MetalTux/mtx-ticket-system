// src/app/dashboard/clients/page.tsx
import db from "@/lib/db";
import Link from "next/link";
import { Plus, Building2, Users, Edit, Ticket, Shield } from "lucide-react";
import DeleteClientButton from "@/components/clients/delete-client-button";

export default async function ClientsPage() {
  const clients = await db.clientCompany.findMany({
    include: {
      supportLevel: true, // Incluimos el Nivel de Soporte
      _count: { select: { contacts: true, tickets: true } }
    },
    orderBy: { name: "asc" }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black flex items-center gap-2 text-slate-900 dark:text-white tracking-tight">
            <Building2 className="w-6 h-6 text-brand-600 dark:text-brand-400" />
            Empresas Cliente
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            Gestión y monitoreo de cuentas activas.
          </p>
        </div>
        <Link href="/dashboard/clients/new" className="btn-primary flex items-center gap-2 shadow-lg shadow-brand-500/20">
          <Plus size={18} /> Nueva Empresa
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {clients.map((client) => (
          <div 
            key={client.id} 
            className={`card-module group relative transition-all duration-300 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:shadow-xl hover:border-brand-500/50 ${
              !client.isActive ? "opacity-60 grayscale-[0.5]" : ""
            }`}
          >
            <div className="absolute top-4 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Link 
                href={`/dashboard/clients/${client.id}/edit`} 
                className="p-2 bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 rounded-lg text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                title="Editar empresa"
              >
                <Edit size={16} />
              </Link>
              <DeleteClientButton id={client.id} clientName={client.name} />
            </div>

            <div className="mb-4 pr-16">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white leading-tight mb-2 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                {client.name}
              </h3>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border tracking-wider uppercase ${
                  client.isActive 
                    ? "border-emerald-500/30 text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400" 
                    : "border-slate-200 text-slate-500 bg-slate-50 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700"
                }`}>
                  {client.isActive ? "Activo" : "Inactivo"}
                </span>
                {client.supportLevel && (
                  <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase">
                    <Shield size={10} className="text-brand-500" />
                    {client.supportLevel.name}
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex gap-6 text-sm text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1.5">
                <Users size={16} className="text-slate-400 dark:text-slate-500" /> 
                <span className="font-bold text-slate-700 dark:text-slate-200">{client._count.contacts}</span> 
                <span className="text-xs">Contactos</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Ticket size={16} className="text-slate-400 dark:text-slate-500" /> 
                <span className="font-bold text-slate-700 dark:text-slate-200">{client._count.tickets}</span> 
                <span className="text-xs">Tickets</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <Link 
                href={`/dashboard/clients/${client.id}`} 
                className="text-xs font-black text-brand-600 dark:text-brand-400 hover:underline uppercase tracking-widest transition-all"
              >
                Ficha Cliente →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
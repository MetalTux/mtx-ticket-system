import db from "@/lib/db";
import Link from "next/link";
import { Plus, Building2, Users, Edit } from "lucide-react"; // Añadimos Edit
import DeleteClientButton from "@/components/clients/delete-client-button";

export default async function ClientsPage() {
  const clients = await db.clientCompany.findMany({
    include: {
      _count: { select: { contacts: true, tickets: true } }
    },
    orderBy: { name: "asc" }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
          <Building2 className="w-6 h-6 text-brand-600" />
          Empresas Cliente
        </h1>
        <Link href="/dashboard/clients/new" className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Nueva Empresa
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {clients.map((client) => (
          <div key={client.id} className="card-module hover:border-brand-500 transition-all group relative">
            {/* Contenedor de Acciones (Esquina superior derecha) */}
            <div className="absolute top-4 right-4 flex items-center gap-1">
              <Link 
                href={`/dashboard/clients/${client.id}/edit`} 
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-brand-600 transition-colors"
                title="Editar empresa"
              >
                <Edit size={16} />
              </Link>
              <DeleteClientButton id={client.id} clientName={client.name} />
            </div>

            <div className="mb-4 pr-16"> {/* pr-16 para que el nombre no choque con los botones */}
              <h3 className="font-bold text-lg text-slate-900 dark:text-white leading-tight mb-1">
                {client.name}
              </h3>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                client.isActive 
                  ? "border-emerald-500 text-emerald-600 bg-emerald-50 dark:bg-emerald-900/10" 
                  : "border-red-400 text-red-500 bg-red-50 dark:bg-red-900/10"
              }`}>
                {client.isActive ? "ACTIVO" : "INACTIVO"}
              </span>
            </div>
            
            <div className="flex gap-6 text-sm text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1">
                <Users size={14} className="text-slate-400" /> 
                <span className="font-medium">{client._count.contacts}</span> Contactos
              </div>
              <div className="flex items-center gap-1">
                <Plus size={14} className="rotate-45 text-slate-400" /> 
                <span className="font-medium">{client._count.tickets}</span> Tickets
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <Link 
                href={`/dashboard/clients/${client.id}`} 
                className="text-xs font-bold text-slate-400 hover:text-brand-600 uppercase tracking-wider transition-colors"
              >
                Ver Ficha →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
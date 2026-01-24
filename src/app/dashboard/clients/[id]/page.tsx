// src/app/dashboard/clients/[id]/page.tsx
import db from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Building2, Users, ArrowLeft, Edit } from "lucide-react";
import DeleteContactButton from "@/components/contacts/delete-contact-button";
import { auth } from "@/auth";

export default async function ClientDetailPage({ params }: { params: { id: string } }) {
  const session = await auth();
  const { id } = await params;

  // SEGURIDAD: Si es un cliente, solo puede ver SU propia empresa
  if (session?.user?.role === "CONTACTO_CLIENTE" && session.user.clientId !== id) {
     return redirect("/dashboard"); 
  }

  const client = await db.clientCompany.findUnique({
    where: { id },
    include: {
      contacts: {
        orderBy: { name: "asc" }
      },
      _count: {
        select: { tickets: true }
      }
    }
  });

  if (!client) notFound();

  return (
    <div className="space-y-6">
      {/* Cabecera / Navegación */}
      <div className="flex justify-between items-center">
        <Link href="/dashboard/clients" className="flex items-center gap-2 text-sm text-slate-500 hover:text-brand-600 transition-colors font-medium">
          <ArrowLeft size={16} /> Volver a la lista
        </Link>
        <Link href={`/dashboard/clients/${client.id}/edit`} className="btn-secondary py-1.5 flex items-center gap-2">
          <Edit size={16} /> Editar Empresa
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card-module">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-brand-100 dark:bg-brand-900/30 rounded-xl text-brand-600">
                <Building2 size={32} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{client.name}</h1>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${
                  client.isActive ? "border-emerald-500 text-emerald-600 bg-emerald-50" : "border-red-400 text-red-500 bg-red-50"
                }`}>
                  {client.isActive ? "Empresa Activa" : "Empresa Inactiva"}
                </span>
              </div>
            </div>
          </div>

          {/* LISTA DE CONTACTOS DE ESTA EMPRESA */}
          <div className="card-module">
            <div className="flex justify-between items-center mb-4 border-b dark:border-slate-800 pb-4">
              <h2 className="font-bold flex items-center gap-2 text-slate-700 dark:text-slate-200">
                <Users size={18} className="text-slate-400" />
                Contactos Asociados
              </h2>
              {/* CORRECCIÓN 1: Ruta jerárquica para nuevo contacto */}
              <Link href={`/dashboard/clients/${client.id}/contacts/new`} className="text-xs font-bold text-brand-600 hover:text-brand-700 underline uppercase tracking-tighter">
                + Agregar Contacto
              </Link>
            </div>
            
            <div className="divide-y dark:divide-slate-800">
              {client.contacts.length === 0 ? (
                <p className="py-8 text-sm text-slate-400 italic text-center">No hay contactos registrados para esta empresa.</p>
              ) : (
                client.contacts.map(contact => (
                  <div key={contact.id} className="py-4 flex justify-between items-center group">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        {contact.name}
                        {!contact.isActive && <span className="text-[9px] bg-red-100 text-red-600 px-1.5 rounded">Inactivo</span>}
                      </p>
                      <p className="text-xs text-slate-500">{contact.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* CORRECCIÓN 2: Ruta jerárquica para editar contacto */}
                      <Link 
                        href={`/dashboard/clients/${client.id}/contacts/${contact.id}/edit`} 
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-brand-600 transition-colors"
                      >
                        <Edit size={16} />
                      </Link>
                      <DeleteContactButton id={contact.id} name={contact.name!} clientId={client.id} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="card-module bg-brand-600 text-white border-none overflow-hidden relative">
            <div className="relative z-10">
              <h3 className="text-sm font-medium opacity-80 mb-1">Total de Tickets</h3>
              <p className="text-4xl font-black">{client._count.tickets}</p>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-10 rotate-12">
               <Building2 size={120} />
            </div>
          </div>
          
          <div className="card-module">
            <h3 className="text-xs font-bold uppercase text-slate-400 mb-4 tracking-widest">Detalles del Sistema</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">ID:</span>
                <span className="font-mono text-[10px] bg-slate-100 dark:bg-slate-800 p-1 rounded leading-none">{client.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Alta:</span>
                <span className="font-medium">{new Date(client.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
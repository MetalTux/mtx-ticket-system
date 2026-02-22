// src/app/dashboard/clients/[id]/page.tsx
import db from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Building2, Users, ArrowLeft, Edit, Mail } from "lucide-react";
import DeleteContactButton from "@/components/contacts/delete-contact-button";
import { auth } from "@/auth";

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const { id } = await params;

  if (session?.user?.role === "CONTACTO_CLIENTE" && session.user.clientId !== id) {
     return redirect("/dashboard"); 
  }

  const client = await db.clientCompany.findUnique({
    where: { id },
    include: {
      contacts: { orderBy: { name: "asc" } },
      _count: { select: { tickets: true } }
    }
  });

  if (!client) notFound();

  return (
    <div className="space-y-6 pb-10 transition-colors duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Link href="/dashboard/clients" className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-brand-600 transition-all font-bold group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Volver a la lista
        </Link>
        <Link href={`/dashboard/clients/${client.id}/edit`} className="btn-secondary py-2 px-4 flex items-center gap-2 text-xs font-black uppercase tracking-widest">
          <Edit size={14} /> Editar Empresa
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="card-module bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm p-6">
            <div className="flex items-center gap-5">
              <div className="p-4 bg-brand-50 dark:bg-brand-500/10 rounded-2xl text-brand-600 dark:text-brand-400 border border-brand-100 dark:border-brand-500/20 shadow-sm">
                <Building2 size={40} />
              </div>
              <div>
                <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{client.name}</h1>
                <span className={`inline-block mt-2 text-[10px] font-black px-3 py-1 rounded-full border uppercase tracking-widest ${
                  client.isActive 
                  ? "border-emerald-200 bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20" 
                  : "border-red-200 bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20"
                }`}>
                  {client.isActive ? "Empresa Activa" : "Empresa Inactiva"}
                </span>
              </div>
            </div>
          </div>

          <div className="card-module bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800">
              <h2 className="font-black text-xs uppercase tracking-[0.2em] flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <Users size={16} />
                Contactos Asociados
              </h2>
              <Link href={`/dashboard/clients/${client.id}/contacts/new`} className="text-[10px] font-black text-brand-600 dark:text-brand-400 hover:text-brand-700 uppercase tracking-widest border-b-2 border-brand-500/20 hover:border-brand-500 transition-all">
                + Nuevo Contacto
              </Link>
            </div>
            
            <div className="divide-y divide-slate-50 dark:divide-slate-800/50">
              {client.contacts.length === 0 ? (
                <div className="p-12 text-center">
                   <p className="text-sm text-slate-400 italic">No hay contactos registrados.</p>
                </div>
              ) : (
                client.contacts.map(contact => (
                  <div key={contact.id} className="p-6 flex justify-between items-center group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 flex items-center justify-center font-bold text-sm">
                        {contact.name?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                          {contact.name}
                          {!contact.isActive && <span className="text-[9px] font-black bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 px-2 py-0.5 rounded border border-red-200 dark:border-red-500/30 uppercase">Inactivo</span>}
                        </p>
                        <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <Mail size={12} className="opacity-50"/> {contact.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link 
                        href={`/dashboard/clients/${client.id}/contacts/${contact.id}/edit`} 
                        className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-brand-600 border border-transparent hover:border-slate-100 dark:hover:border-slate-600 transition-all"
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

        <div className="space-y-6">
          <div className="card-module bg-brand-600 dark:bg-brand-500 text-white border-none shadow-xl shadow-brand-500/20 p-8 relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] opacity-70 mb-2">Total Histórico</h3>
              <p className="text-5xl font-black tracking-tighter">{client._count.tickets}</p>
              <p className="text-xs font-bold mt-2 opacity-80 uppercase">Tickets Registrados</p>
            </div>
            <Building2 size={120} className="absolute -right-6 -bottom-6 opacity-10 rotate-12" />
          </div>
          
          <div className="card-module bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-6 space-y-6">
            <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Identificación Interna</h3>
            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">ID de Base de Datos</span>
                <p className="font-mono text-[10px] bg-slate-100 dark:bg-slate-800 p-2 rounded-lg text-slate-500 dark:text-slate-400 break-all">{client.id}</p>
              </div>
              <div className="flex justify-between items-end border-t border-slate-50 dark:border-slate-800 pt-4">
                <span className="text-xs font-bold text-slate-500">Fecha de Alta:</span>
                <span className="text-sm font-black text-slate-700 dark:text-slate-300">{new Date(client.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
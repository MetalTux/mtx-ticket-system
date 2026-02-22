// src/app/dashboard/clients/[id]/contacts/[contactId]/edit/page.tsx
import db from "@/lib/db";
import { notFound } from "next/navigation";
import ContactForm from "@/components/contacts/contact-form";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function EditContactPage({ params }: { params: Promise<{ id: string, contactId: string }> }) {
  // En Next.js 15+ params es una Promise
  const { id, contactId } = await params;

  const [client, contact] = await Promise.all([
    db.clientCompany.findUnique({ where: { id } }),
    db.user.findUnique({ where: { id: contactId } })
  ]);

  if (!client || !contact) notFound();

  return (
    <div className="max-w-3xl mx-auto py-10 space-y-8 transition-colors duration-300">
      <Link 
        href={`/dashboard/clients/${id}`} 
        className="group flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-all"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
        Volver a la ficha de {client.name}
      </Link>
      
      <div className="space-y-2">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">
          Editar Contacto Autorizado
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
          Modifica las credenciales o el estado de acceso para este usuario.
        </p>
      </div>
      
      <ContactForm 
        clientId={client.id} 
        clientName={client.name} 
        initialData={contact} 
      />
    </div>
  );
}
// src/app/dashboard/clients/[id]/contacts/[contactId]/edit/page.tsx
import db from "@/lib/db";
import { notFound } from "next/navigation";
import ContactForm from "@/components/contacts/contact-form";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function EditContactPage({ params }: { params: { id: string, contactId: string } }) {
  const { id, contactId } = await params;

  const [client, contact] = await Promise.all([
    db.clientCompany.findUnique({ where: { id } }),
    db.user.findUnique({ where: { id: contactId } })
  ]);

  if (!client || !contact) notFound();

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-6">
      <Link href={`/dashboard/clients/${id}`} className="text-sm text-slate-500 hover:text-brand-600 flex items-center gap-2">
        <ArrowLeft size={16} /> Volver a {client.name}
      </Link>
      
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Editar Contacto</h1>
      
      {/* Pasamos el contact como initialData para que el form sepa que es edición */}
      <ContactForm 
        clientId={client.id} 
        clientName={client.name} 
        initialData={contact} 
      />
    </div>
  );
}
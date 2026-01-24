// src/app/dashboard/clients/[id]/contacts/new/page.tsx
import db from "@/lib/db";
import { notFound } from "next/navigation";
import ContactForm from "@/components/contacts/contact-form";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function NewContactPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const client = await db.clientCompany.findUnique({ where: { id } });

  if (!client) notFound();

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-6">
      <Link href={`/dashboard/clients/${id}`} className="text-sm text-slate-500 hover:text-brand-600 flex items-center gap-2">
        <ArrowLeft size={16} /> Volver a {client.name}
      </Link>
      
      <h1 className="text-2xl font-bold">Nuevo Contacto</h1>
      <ContactForm clientId={client.id} clientName={client.name} />
    </div>
  );
}
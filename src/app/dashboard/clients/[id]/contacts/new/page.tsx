// src/app/dashboard/clients/[id]/contacts/new/page.tsx
import db from "@/lib/db";
import { notFound } from "next/navigation";
import ContactForm from "@/components/contacts/contact-form";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function NewContactPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const client = await db.clientCompany.findUnique({ where: { id } });

  if (!client) notFound();

  return (
    <div className="max-w-3xl mx-auto py-10 space-y-8 transition-colors duration-300">
      <Link href={`/dashboard/clients/${id}`} className="group flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-brand-600 transition-all">
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Volver a {client.name}
      </Link>
      
      <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">Nuevo Contacto Autorizado</h1>
      <ContactForm clientId={client.id} clientName={client.name} />
    </div>
  );
}
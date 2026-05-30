// src/app/dashboard/clients/[id]/edit/page.tsx
import db from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import ClientForm from "@/components/clients/client-form";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/auth";

export default async function EditClientPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const { id } = await params;
  
  const client = await db.clientCompany.findUnique({
    where: { id }
  });

  if (!client) notFound();

  const supportLevels = await db.supportLevel.findMany({
    where: { providerId: session?.user?.providerId, isActive: true },
    select: { id: true, name: true, description: true },
    orderBy: { name: 'asc' }
  });

  return (
    <>
      <div className="flex justify-between items-center">
      </div>
      <div className="max-w-2xl mx-auto py-8 space-y-6">
        <Link href="/dashboard/clients" className="flex items-center gap-2 text-sm text-slate-500 hover:text-brand-600 transition-colors font-medium">
          <ArrowLeft size={16} /> Volver a la lista
        </Link>
        <h1 className="text-2xl font-bold mb-6">Editar Empresa: {client.name}</h1>
        <ClientForm initialData={client} supportLevels={supportLevels} />
      </div>
    </>
  );
}
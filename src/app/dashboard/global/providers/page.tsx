// src/app/dashboard/global/providers/page.tsx
import db from "@/lib/db";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import ProviderListClient from "@/components/global/provider-list-client";
import { Building2, Globe } from "lucide-react";

export default async function GlobalProvidersPage() {
  const session = await auth();
  if (session?.user?.role !== "SUPER_ADMIN") redirect("/dashboard");

  const providers = await db.providerCompany.findMany({
    include: {
      _count: { select: { users: true, tickets: true } }
    },
    orderBy: { name: 'asc' }
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-8 px-4">
      <header className="flex justify-between items-end border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter flex items-center gap-3">
            <Globe className="text-brand-600" size={32} />
            Gestión de Proveedores
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            Control central de empresas y acceso a la plataforma.
          </p>
        </div>
      </header>

      <ProviderListClient initialProviders={providers} />
    </div>
  );
}
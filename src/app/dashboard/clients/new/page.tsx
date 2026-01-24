// src/app/dashboard/clients/new/page.tsx
import Link from "next/link";
import ClientForm from "@/components/clients/client-form";

export default function NewClientPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6 py-8">
      <div>
        <Link href="/dashboard/clients" className="text-sm text-brand-600 hover:underline">
          ← Volver a empresas
        </Link>
        <h1 className="text-2xl font-bold mt-2 text-slate-900 dark:text-white">
          Registrar Nueva Empresa Cliente
        </h1>
      </div>

      <ClientForm />
    </div>
  );
}
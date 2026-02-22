// src/app/dashboard/clients/new/page.tsx
import Link from "next/link";
import ClientForm from "@/components/clients/client-form";
import { ArrowLeft } from "lucide-react";

export default function NewClientPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-8 py-10 transition-colors duration-300">
      <div>
        <Link href="/dashboard/clients" className="group flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-brand-600 transition-all">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Volver a empresas
        </Link>
        <h1 className="text-3xl font-black mt-4 text-slate-900 dark:text-white tracking-tighter">
          Registrar Nueva Empresa Cliente
        </h1>
      </div>
      <ClientForm />
    </div>
  );
}
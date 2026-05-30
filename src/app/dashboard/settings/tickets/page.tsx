// src/app/dashboard/settings/tickets/page.tsx
import { auth } from "@/auth";
import { getTicketMasters } from "@/lib/actions/masters";
import { redirect } from "next/navigation";
import TicketMastersTabs from "@/components/settings/ticket-masters-tabs";
import { Settings2 } from "lucide-react";
import { TicketMastersResponse } from "@/types/masters";

export default async function TicketSettingsPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/dashboard");

  const masters = await getTicketMasters();
  
  if ("error" in masters) {
    return <div className="p-10 text-red-500 font-bold">Error al cargar la configuración.</div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-8 px-4">
      <header className="flex flex-col gap-1 border-b border-slate-200 dark:border-slate-800 pb-6">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter flex items-center gap-3">
          <Settings2 className="text-brand-600" size={32} />
          Configuración Global de Tickets
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium">
          Personaliza los estados, prioridades, niveles de soporte y más para {session.user.providerId}.
        </p>
      </header>

      {/* Se pasa estrictamente como TicketMastersResponse */}
      <TicketMastersTabs masters={masters as TicketMastersResponse} />
    </div>
  );
}
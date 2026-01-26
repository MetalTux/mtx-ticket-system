// src/app/dashboard/users/page.tsx
import { auth } from "@/auth";
import db from "@/lib/db";
import { redirect } from "next/navigation";
import UserTable from "@/components/users/user-table";
import { Plus } from "lucide-react";
import Link from "next/link";

export default async function UsersPage() {
  const session = await auth();
  
  // Seguridad: Solo Admins de la proveedora pueden gestionar staff
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const providerId = session.user.providerId;

  const provider = await db.providerCompany.findUnique({
    where: {
      id: providerId,
    },
  });

  const users = await db.user.findMany({
    where: {
      providerId: providerId,
      role: { not: "CONTACTO_CLIENTE" }
    },
    orderBy: { name: 'asc' },
    include: {
      provider: { select: { name: true } }
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Usuarios de Sistema</h1>
          <p className="text-slate-500 text-sm font-medium">Gestiona el equipo de {provider?.name}</p>
        </div>
        <Link href="/dashboard/users/new" className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          Nuevo Integrante
        </Link>
      </div>

      <div className="card-module p-0 overflow-hidden shadow-sm">
        <UserTable initialUsers={users} />
      </div>
    </div>
  );
}
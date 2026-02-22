// src/app/dashboard/users/page.tsx
import { auth } from "@/auth";
import db from "@/lib/db";
import { redirect } from "next/navigation";
import UserTable from "@/components/users/user-table";
import { Plus, Users } from "lucide-react"; // Añadimos icono para coherencia
import Link from "next/link";

export default async function UsersPage() {
  const session = await auth();
  
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const providerId = session.user.providerId;

  const provider = await db.providerCompany.findUnique({
    where: { id: providerId },
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Users className="text-brand-600 dark:text-brand-400" />
            Usuarios de Sistema
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
            Gestiona el equipo de <span className="text-slate-700 dark:text-slate-200">{provider?.name}</span>
          </p>
        </div>
        <Link href="/dashboard/users/new" className="btn-primary flex items-center gap-2 shadow-lg shadow-brand-500/20">
          <Plus size={18} />
          Nuevo Integrante
        </Link>
      </div>

      <div className="card-module p-0 overflow-hidden shadow-sm bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <UserTable initialUsers={users} />
      </div>
    </div>
  );
}

// // src/app/dashboard/users/page.tsx
// import { auth } from "@/auth";
// import db from "@/lib/db";
// import { redirect } from "next/navigation";
// import UserTable from "@/components/users/user-table";
// import { Plus } from "lucide-react";
// import Link from "next/link";

// export default async function UsersPage() {
//   const session = await auth();
  
//   // Seguridad: Solo Admins de la proveedora pueden gestionar staff
//   if (!session?.user || session.user.role !== "ADMIN") {
//     redirect("/dashboard");
//   }

//   const providerId = session.user.providerId;

//   const provider = await db.providerCompany.findUnique({
//     where: {
//       id: providerId,
//     },
//   });

//   const users = await db.user.findMany({
//     where: {
//       providerId: providerId,
//       role: { not: "CONTACTO_CLIENTE" }
//     },
//     orderBy: { name: 'asc' },
//     include: {
//       provider: { select: { name: true } }
//     }
//   });

//   return (
//     <div className="space-y-6">
//       <div className="flex justify-between items-center">
//         <div>
//           <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Usuarios de Sistema</h1>
//           <p className="text-slate-500 text-sm font-medium">Gestiona el equipo de {provider?.name}</p>
//         </div>
//         <Link href="/dashboard/users/new" className="btn-primary flex items-center gap-2">
//           <Plus size={18} />
//           Nuevo Integrante
//         </Link>
//       </div>

//       <div className="card-module p-0 overflow-hidden shadow-sm">
//         <UserTable initialUsers={users} />
//       </div>
//     </div>
//   );
// }
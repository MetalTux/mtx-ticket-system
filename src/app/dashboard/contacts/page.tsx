import db from "@/lib/db";
import { UserPlus, Mail, Building, Users } from "lucide-react";

export default async function ContactsPage() {
  const contacts = await db.user.findMany({
    where: { role: "CONTACTO_CLIENTE" },
    include: { client: true },
    orderBy: { name: "asc" }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Users className="w-6 h-6 text-brand-600" />
          Contactos de Clientes
        </h1>
        <button className="btn-primary flex items-center gap-2">
          <UserPlus size={18} /> Nuevo Contacto
        </button>
      </div>

      <div className="card-module overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 dark:bg-slate-900/50 text-[10px] font-bold uppercase text-slate-500">
            <tr>
              <th className="p-4">Nombre / Email</th>
              <th className="p-4">Empresa</th>
              <th className="p-4">Fecha Registro</th>
              <th className="p-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y dark:divide-slate-800">
            {contacts.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors">
                <td className="p-4">
                  <div className="font-bold">{user.name}</div>
                  <div className="text-xs text-slate-400 flex items-center gap-1">
                    <Mail size={10} /> {user.email}
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <Building size={14} className="text-slate-400" />
                    {user.client?.name}
                  </div>
                </td>
                <td className="p-4 text-slate-400 text-xs">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="p-4 text-right">
                  <button className="text-brand-600 font-bold hover:underline">Editar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
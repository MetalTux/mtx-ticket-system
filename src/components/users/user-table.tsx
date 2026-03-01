"use client";

import { User } from "@prisma/client";
import { useState, useEffect } from "react";
import { Mail, Shield, Edit3, MoreHorizontal } from "lucide-react"; // Añadimos MoreHorizontal
import Link from "next/link";
import DeleteUserButton from "./delete-user-button";

export default function UserTable({ initialUsers }: { initialUsers: User[] }) {
  const [users, setUsers] = useState(initialUsers);

  useEffect(() => {
    setUsers(initialUsers);
  }, [initialUsers]);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse min-w-[600px]">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800">
            <th className="p-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Usuario</th>
            <th className="p-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Rol</th>
            <th className="p-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Estado</th>
            <th className="p-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {users.map((user) => (
            <tr key={user.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
              <td className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center font-black shadow-sm border border-brand-200 dark:border-brand-500/20 flex-shrink-0">
                    {user.name?.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors truncate">
                      {user.name}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1 truncate">
                      <Mail size={12} className="flex-shrink-0"/> {user.email}
                    </p>
                  </div>
                </div>
              </td>
              <td className="p-4">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-black text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md uppercase border border-slate-200 dark:border-slate-700 whitespace-nowrap">
                  <Shield size={12} className="text-brand-500"/>
                  {user.role?.replace('_', ' ')}
                </span>
              </td>
              <td className="p-4">
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border whitespace-nowrap ${
                  user.isActive 
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' 
                    : 'bg-slate-50 text-slate-400 border-slate-200 dark:bg-slate-800 dark:text-slate-500 dark:border-slate-700'
                }`}>
                  {user.isActive ? 'Activo' : 'Inactivo'}
                </span>
              </td>
              <td className="p-4 text-right">
                <div className="flex justify-end gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all duration-200">
                  <Link 
                    href={`/dashboard/users/${user.id}/edit`}
                    className="p-2 text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
                    title="Editar Perfil"
                  >
                    <Edit3 size={18}/>
                  </Link>
                  <DeleteUserButton 
                    id={user.id} 
                    name={user.name!} 
                    isActive={user.isActive} 
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
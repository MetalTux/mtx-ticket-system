// src/components/users/user-table.tsx
"use client";

import { User } from "@prisma/client";
import { useState, useEffect } from "react";
import { Mail, Shield, Edit3 } from "lucide-react";
import Link from "next/link";
import DeleteUserButton from "./delete-user-button";

export default function UserTable({ initialUsers }: { initialUsers: User[] }) {
  const [users, setUsers] = useState(initialUsers);

  useEffect(() => {
    setUsers(initialUsers);
  }, [initialUsers]);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
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
                  <div className="w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center font-black shadow-sm border border-brand-200 dark:border-brand-500/20">
                    {user.name?.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                      {user.name}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1">
                      <Mail size={12}/> {user.email}
                    </p>
                  </div>
                </div>
              </td>
              <td className="p-4">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-black text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md uppercase border border-slate-200 dark:border-slate-700">
                  <Shield size={12} className="text-brand-500"/>
                  {user.role}
                </span>
              </td>
              <td className="p-4">
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${
                  user.isActive 
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' 
                    : 'bg-slate-50 text-slate-400 border-slate-200 dark:bg-slate-800 dark:text-slate-500 dark:border-slate-700'
                }`}>
                  {user.isActive ? 'Activo' : 'Inactivo'}
                </span>
              </td>
              <td className="p-4 text-right">
                <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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

// // src/components/users/user-table.tsx
// "use client";

// import { User } from "@prisma/client";
// import { useState, useEffect } from "react";
// import { Mail, Shield, Power, Edit3 } from "lucide-react";
// import Link from "next/link";
// import DeleteUserButton from "./delete-user-button";

// export default function UserTable({ initialUsers }: { initialUsers: User[] }) {
//   const [users, setUsers] = useState(initialUsers);

//   // Si los props cambian (por revalidatePath), actualizamos el estado local
//   useEffect(() => {
//     setUsers(initialUsers);
//   }, [initialUsers]);

//   return (
//     <div className="overflow-x-auto">
//       <table className="w-full text-left border-collapse">
//         <thead>
//           <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
//             <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Usuario</th>
//             <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Rol</th>
//             <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Estado</th>
//             <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Acciones</th>
//           </tr>
//         </thead>
//         <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
//           {users.map((user) => (
//             <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
//               <td className="p-4">
//                 <div className="flex items-center gap-3">
//                   <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center font-bold">
//                     {user.name?.charAt(0)}
//                   </div>
//                   <div>
//                     <p className="text-sm font-bold text-slate-800 dark:text-white">{user.name}</p>
//                     <p className="text-xs text-slate-400 flex items-center gap-1"><Mail size={12}/> {user.email}</p>
//                   </div>
//                 </div>
//               </td>
//               <td className="p-4">
//                 <span className="flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-md">
//                   <Shield size={12} className="text-brand-500"/>
//                   {user.role}
//                 </span>
//               </td>
//               <td className="p-4">
//                 <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase ${user.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
//                   {user.isActive ? 'Activo' : 'Inactivo'}
//                 </span>
//               </td>
//               <td className="p-4 text-right">
//                 <div className="flex justify-end gap-2">
//                   <Link 
//                     href={`/dashboard/users/${user.id}/edit`}
//                     className="p-2 text-slate-400 hover:text-brand-600 transition-colors"
//                   >
//                     <Edit3 size={18}/>
//                   </Link>
                  
//                   <DeleteUserButton 
//                     id={user.id} 
//                     name={user.name!} 
//                     isActive={user.isActive} 
//                   />
//                 </div>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// }
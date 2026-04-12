// src/components/layout/sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { handleSignOut } from "@/lib/actions/auth";
import Logo from "@/components/ui/logo";
import { Globe, Settings2, LayoutDashboard, Ticket, Building2, Users } from "lucide-react";

// Actualizamos los iconos con los engranajes y el nuevo de Gestión Global
const Icons = {
  Dashboard: () => <LayoutDashboard className="w-5 h-5" />,
  Tickets: () => <Ticket className="w-5 h-5" />,
  Clients: () => <Building2 className="w-5 h-5" />,
  Users: () => <Users className="w-5 h-5" />,
  // El ícono de engranajes (Settings2 de Lucide es ideal)
  Settings: () => <Settings2 className="w-5 h-5" />,
  // Ícono para el Gestor Global
  Global: () => <Globe className="w-5 h-5" />,
};

interface SidebarProps {
  onClose?: () => void;
  className?: string;
  user: {
    name?: string | null;
    role?: string;
  };
}

export default function Sidebar({ onClose, className, user }: SidebarProps) {
  const pathname = usePathname();
  const role = user.role;

  const menuItems = [
    // --- VISTAS OPERATIVAS (Ocultas para SUPER_ADMIN) ---
    { label: "Dashboard", href: "/dashboard", icon: Icons.Dashboard, show: (role !== "SUPER_ADMIN") },
    { label: "Mis Tickets", href: "/dashboard/tickets", icon: Icons.Tickets, show: (role !== "SUPER_ADMIN") },
    { label: "Clientes", href: "/dashboard/clients", icon: Icons.Clients, show: (role !== "CONTACTO_CLIENTE" && role !== "SUPER_ADMIN") },
    
    // --- VISTAS DE ADMINISTRACIÓN DE PROVEEDOR (Solo ADMIN) ---
    { label: "Usuarios", href: "/dashboard/users", icon: Icons.Users, show: (role === "ADMIN") },
    { label: "Configuración", href: "/dashboard/settings/tickets", icon: Icons.Settings, show: (role === "ADMIN") },

    // --- VISTAS GLOBALES (Solo SUPER_ADMIN) ---
    { label: "Gestión Global", href: "/dashboard/global/providers", icon: Icons.Global, show: (role === "SUPER_ADMIN") },
  ];

  return (
    <aside className={`
      bg-white dark:bg-slate-900 
      border-r border-slate-200 dark:border-slate-800 
      flex flex-col transition-colors duration-300
      ${className}
    `}>
      <div className="p-6 border-b border-slate-50 dark:border-slate-800/50">
        <Link href="/dashboard" onClick={onClose} className="block hover:opacity-80 transition-opacity">
          <Logo className="scale-90 origin-left" />
        </Link>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = item.href === "/dashboard" 
            ? pathname === "/dashboard" 
            : pathname.startsWith(item.href);

          return item.show && (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`
                flex items-center gap-3 px-3 py-2 text-sm font-bold rounded-xl transition-all group
                ${isActive 
                  ? "bg-nexo-dark/5 dark:bg-nexo-light/10 text-nexo-dark dark:text-nexo-light" 
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-nexo-dark dark:hover:text-nexo-light"
                }
              `}
            >
              <span className={`
                transition-colors
                ${isActive ? "text-nexo-dark dark:text-nexo-light" : "text-slate-400 group-hover:text-nexo-dark dark:group-hover:text-nexo-light"}
              `}>
                <item.icon />
              </span>
              {item.label}
                            
              {isActive && (
                <div className="ml-auto w-1 h-4 rounded-full bg-nexo-dark dark:bg-nexo-light shadow-[0_0_8px_rgba(17,62,66,0.4)] dark:shadow-[0_0_8px_rgba(160,227,213,0.4)]" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* FOOTER DEL USUARIO */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="flex items-center gap-3 px-2 py-3">
          <div className="w-9 h-9 rounded-xl bg-nexo-dark dark:bg-nexo-light flex items-center justify-center text-white dark:text-slate-900 text-sm font-black shadow-lg shadow-nexo-dark/20 dark:shadow-nexo-light/10">
            {user.name?.[0] || "U"}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-bold text-slate-900 dark:text-white truncate leading-none mb-1">
              {user.name}
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-500 font-black uppercase tracking-widest truncate">
              {role?.replace('_', ' ')}
            </p>
          </div>
        </div>
        
        <form action={handleSignOut}>
          <button type="submit" className="w-full mt-2 flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all border border-transparent hover:border-red-100 dark:hover:border-red-900/30">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
            </svg>
            Cerrar Sesión
          </button>
        </form>
      </div>
    </aside>
  );
}

// // src/components/layout/sidebar.tsx
// "use client";

// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import { handleSignOut } from "@/lib/actions/auth";
// import Logo from "@/components/ui/logo"; // Importamos el nuevo Logo

// // Mantengo tus iconos exactamente iguales
// const Icons = {
//   Dashboard: () => (
//     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
//       <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
//     </svg>
//   ),
//   Tickets: () => (
//     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
//       <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 0 1 0 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 0 1 0-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375Z" />
//     </svg>
//   ),
//   Clients: () => (
//     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
//       <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12a2.25 2.25 0 0 1 2.25 2.25V21" />
//     </svg>
//   ),
//   Users: () => (
//     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
//       <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
//     </svg>
//   ),
//   Settings: () => (
//     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
//       <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12a7.5 7.5 0 0 0 15 0m-15 0a7.5 7.5 0 1 1 15 0m-15 0H3m16.5 0H21m-1.5 0H12m-8.457 3.077 1.41-.513m14.095-5.13 1.41-.513M5.106 5.272l1.41.513m14.47 12.433 1.41.513M9.987 8.244l.418-.992m9.428 4.482.418-.992m-1.147 7.936a.418.992 0 0 1-.418.992m-12.896-9.92.418-.992" />
//     </svg>
//   ),
// };

// interface SidebarProps {
//   onClose?: () => void;
//   className?: string;
//   user: {
//     name?: string | null;
//     role?: string;
//   };
// }

// export default function Sidebar({ onClose, className, user }: SidebarProps) {
//   const pathname = usePathname();
//   const role = user.role;

//   const menuItems = [
//     { label: "Dashboard", href: "/dashboard", icon: Icons.Dashboard, show: (role !== "SUPER_ADMIN") },
//     { label: "Mis Tickets", href: "/dashboard/tickets", icon: Icons.Tickets, show: (role !== "SUPER_ADMIN") },
//     { label: "Clientes", href: "/dashboard/clients", icon: Icons.Clients, show: (role !== "CONTACTO_CLIENTE") },
//     { label: "Usuarios", href: "/dashboard/users", icon: Icons.Users, show: (role === "ADMIN") },
//     { label: "Configuración", href: "/dashboard/settings/tickets", icon: Icons.Settings, show: (role === "ADMIN") },
//   ];

//   return (
//     <aside className={`
//       bg-white dark:bg-slate-900 
//       border-r border-slate-200 dark:border-slate-800 
//       flex flex-col transition-colors duration-300
//       ${className}
//     `}>
//       {/* SECCIÓN DEL LOGO ACTUALIZADA */}
//       <div className="p-6 border-b border-slate-50 dark:border-slate-800/50">
//         <Link href="/dashboard" onClick={onClose} className="block hover:opacity-80 transition-opacity">
//           <Logo className="scale-90 origin-left" />
//         </Link>
//       </div>

//       <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
//         {menuItems.map((item) => {
//           const isActive = item.href === "/dashboard" 
//             ? pathname === "/dashboard" 
//             : pathname.startsWith(item.href);

//           return item.show && (
//             <Link
//               key={item.href}
//               href={item.href}
//               onClick={onClose}
//               className={`
//                 flex items-center gap-3 px-3 py-2 text-sm font-bold rounded-xl transition-all group
//                 ${isActive 
//                   ? "bg-nexo-dark/5 dark:bg-nexo-light/10 text-nexo-dark dark:text-nexo-light" 
//                   : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-nexo-dark dark:hover:text-nexo-light"
//                 }
//               `}
//             >
//               <span className={`
//                 transition-colors
//                 ${isActive ? "text-nexo-dark dark:text-nexo-light" : "text-slate-400 group-hover:text-nexo-dark dark:group-hover:text-nexo-light"}
//               `}>
//                 <item.icon />
//               </span>
//               {item.label}
                            
//               {isActive && (
//                 <div className="ml-auto w-1 h-4 rounded-full bg-nexo-dark dark:bg-nexo-light shadow-[0_0_8px_rgba(17,62,66,0.4)] dark:shadow-[0_0_8px_rgba(160,227,213,0.4)]" />
//               )}
//             </Link>
//           );
//         })}
//       </nav>

//       {/* FOOTER DEL USUARIO */}
//       <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
//         <div className="flex items-center gap-3 px-2 py-3">
//           {/* Círculo de avatar usando el color de la marca */}
//           <div className="w-9 h-9 rounded-xl bg-nexo-dark dark:bg-nexo-light flex items-center justify-center text-white dark:text-slate-900 text-sm font-black shadow-lg shadow-nexo-dark/20 dark:shadow-nexo-light/10">
//             {user.name?.[0] || "U"}
//           </div>
//           <div className="flex-1 overflow-hidden">
//             <p className="text-sm font-bold text-slate-900 dark:text-white truncate leading-none mb-1">
//               {user.name}
//             </p>
//             <p className="text-[10px] text-slate-500 dark:text-slate-500 font-black uppercase tracking-widest truncate">
//               {role?.replace('_', ' ')}
//             </p>
//           </div>
//         </div>
        
//         <form action={handleSignOut}>
//           <button type="submit" className="w-full mt-2 flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all border border-transparent hover:border-red-100 dark:hover:border-red-900/30">
//             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
//               <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
//             </svg>
//             Cerrar Sesión
//           </button>
//         </form>
//       </div>
//     </aside>
//   );
// }
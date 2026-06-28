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
  Settings: () => <Settings2 className="w-5 h-5" />,
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
        
        {/* --- AQUÍ EL CAMBIO: El bloque de usuario ahora es un Link a /dashboard/profile --- */}
        <Link 
          href="/dashboard/profile"
          onClick={onClose}
          title="Ver mi perfil y seguridad"
          className="flex items-center gap-3 px-2 py-3 rounded-xl hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-all group cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-nexo-dark dark:bg-nexo-light flex items-center justify-center text-white dark:text-slate-900 text-sm font-black shadow-lg shadow-nexo-dark/20 dark:shadow-nexo-light/10 group-hover:scale-105 transition-transform">
            {user.name?.[0] || "U"}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-bold text-slate-900 dark:text-white truncate leading-none mb-1 group-hover:text-nexo-dark dark:group-hover:text-nexo-light transition-colors">
              {user.name}
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-500 font-black uppercase tracking-widest truncate">
              {role?.replace('_', ' ')}
            </p>
          </div>
        </Link>
        {/* --------------------------------------------------------------------------------- */}

        <form action={handleSignOut}>
          <button type="submit" className="w-full mt-2 flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all border border-transparent hover:border-red-100 dark:hover:border-red-900/30">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
            </svg>
            Cerrar Sesión
          </button>
        </form>

        <div className="mt-4 flex flex-col items-center justify-center gap-0.5 text-center">
          <p className="text-[9px] text-slate-400/80 dark:text-slate-600 font-mono font-medium">
            Versión: {process.env.NEXT_PUBLIC_APP_VERSION} • {process.env.NEXT_PUBLIC_BUILD_DATE}
          </p>
        </div>
      </div>
    </aside>
  );
}
// src/components/layout/mobile-header.tsx
"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import Sidebar from "./sidebar";
import Logo from "@/components/ui/logo"; // Importamos el logo oficial

interface MobileHeaderProps {
  user: {
    name?: string | null;
    role?: string;
  };
}

export default function MobileHeader({ user }: MobileHeaderProps) {
  const [isOpen, setIsOpen] = useState(false);

  const closeMenu = () => setIsOpen(false);

  return (
    <header className="lg:!hidden flex items-center justify-between p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 transition-colors duration-500">
      
      {/* Identidad NexoOps en Móvil */}
      <div className="flex items-center gap-2">
        <Logo className="scale-75 origin-left" />
      </div>

      {/* Botón Hamburguesa con colores de la marca */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 rounded-xl transition-all active:scale-95"
      >
        {isOpen ? (
          <X size={24} className="text-red-500" /> 
        ) : (
          <Menu size={24} className="text-nexo-dark dark:text-nexo-light" />
        )}
      </button>

      {/* Menú Lateral Desplegable */}
      {isOpen && (
        <div className="fixed inset-0 z-50">
          {/* Fondo oscuro traslúcido con desenfoque */}
          <div 
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={closeMenu}
          />
          
          {/* Sidebar deslizable (animado) */}
          <div className="fixed inset-y-0 left-0 w-72 shadow-2xl animate-in slide-in-from-left duration-300 ease-out">
            <Sidebar 
              user={user} 
              className="flex h-full w-full border-none rounded-r-3xl" 
              onClose={closeMenu} 
            />
          </div>
        </div>
      )}
    </header>
  );
}

// // src/components/layout/mobile-header.tsx
// "use client";

// import { useState } from "react";
// import { Menu, X, LayoutDashboard } from "lucide-react";
// import Sidebar from "./sidebar";

// interface MobileHeaderProps {
//   user: {
//     name?: string | null;
//     role?: string;
//   };
// }

// export default function MobileHeader({ user }: MobileHeaderProps) {
//   const [isOpen, setIsOpen] = useState(false);

//   const closeMenu = () => setIsOpen(false);

//   return (
//     <header className="lg:!hidden flex items-center justify-between p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40">
//       {/* Logo o Identificador en Móvil */}
//       <div className="flex items-center gap-2">
//         <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center shadow-lg shadow-brand-500/20">
//           <LayoutDashboard className="text-white w-5 h-5" />
//         </div>
//         <span className="font-black tracking-tighter text-slate-900 dark:text-white uppercase text-sm">
//           Metal<span className="text-brand-600">Tux</span>
//         </span>
//       </div>

//       {/* Botón Hamburguesa */}
//       <button 
//         onClick={() => setIsOpen(!isOpen)}
//         className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all active:scale-95"
//       >
//         {isOpen ? <X size={24} /> : <Menu size={24} />}
//       </button>

//       {/* Menú Lateral Desplegable (Solo si isOpen es true) */}
//       {isOpen && (
//         <div className="fixed inset-0 z-50">
//           {/* Fondo oscuro traslúcido */}
//           <div 
//             className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm transition-opacity"
//             onClick={closeMenu}
//           />
          
//           {/* Sidebar que se desliza */}
//           <div className="fixed inset-y-0 left-0 w-64 shadow-2xl transition-transform">
//             <Sidebar 
//               user={user} 
//               className="flex h-full w-full border-none" 
//               onClose={closeMenu} 
//             />
//           </div>
//         </div>
//       )}
//     </header>
//   );
// }
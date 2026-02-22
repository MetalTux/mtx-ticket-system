// src/components/tickets/ticket-filters.tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { STATUS_LABELS, CATEGORY_LABELS } from "@/enums/constantes";
import { TicketStatus, Category } from "@prisma/client";
import { FilterX, Search } from "lucide-react";

export default function TicketFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateFilter = (name: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(name, value);
    } else {
      params.delete(name);
    }
    params.set("page", "1");
    router.push(`/dashboard/tickets?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap gap-4 items-end bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
      <div className="flex flex-col gap-2 flex-1 min-w-[160px]">
        <label className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-widest flex items-center gap-1">
          <Search size={12} /> Búsqueda por Estado
        </label>
        <select 
          value={searchParams.get("status") || ""} 
          onChange={(e) => updateFilter("status", e.target.value)}
          className="form-input py-2 text-xs bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
        >
          <option value="">Cualquier estado</option>
          {Object.values(TicketStatus).map((s) => (
            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-2 flex-1 min-w-[160px]">
        <label className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-widest">
          Categorización
        </label>
        <select 
          value={searchParams.get("category") || ""} 
          onChange={(e) => updateFilter("category", e.target.value)}
          className="form-input py-2 text-xs bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
        >
          <option value="">Todas las categorías</option>
          {Object.values(Category).map((c) => (
            <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
          ))}
        </select>
      </div>

      <button 
        onClick={() => router.push("/dashboard/tickets")}
        className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 transition-all border border-transparent hover:border-red-100 dark:hover:border-red-900/30 rounded-xl"
      >
        <FilterX size={14} />
        Limpiar Filtros
      </button>
    </div>
  );
}

// // src/components/tickets/ticket-filters.tsx
// "use client";

// import { useRouter, useSearchParams } from "next/navigation";
// import { STATUS_LABELS, CATEGORY_LABELS } from "@/enums/constantes";
// import { TicketStatus, Category } from "@prisma/client";

// export default function TicketFilters() {
//   const router = useRouter();
//   const searchParams = useSearchParams();

//   const updateFilter = (name: string, value: string) => {
//     const params = new URLSearchParams(searchParams.toString());
//     if (value) {
//       params.set(name, value);
//     } else {
//       params.delete(name);
//     }
//     params.set("page", "1"); // Resetear a la página 1 al filtrar
//     router.push(`/dashboard/tickets?${params.toString()}`);
//   };

//   return (
//     <div className="flex flex-wrap gap-4 items-end bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
//       {/* Filtro de Estado */}
//       <div className="flex flex-col gap-1">
//         <label className="text-[10px] font-bold uppercase text-slate-400">Estado</label>
//         <select 
//           value={searchParams.get("status") || ""} 
//           onChange={(e) => updateFilter("status", e.target.value)}
//           className="form-input py-1.5 text-xs min-w-[140px]"
//         >
//           <option value="">Todos los estados</option>
//           {Object.values(TicketStatus).map((s) => (
//             <option key={s} value={s}>{STATUS_LABELS[s]}</option>
//           ))}
//         </select>
//       </div>

//       {/* Filtro de Categoría */}
//       <div className="flex flex-col gap-1">
//         <label className="text-[10px] font-bold uppercase text-slate-400">Categoría</label>
//         <select 
//           value={searchParams.get("category") || ""} 
//           onChange={(e) => updateFilter("category", e.target.value)}
//           className="form-input py-1.5 text-xs min-w-[140px]"
//         >
//           <option value="">Todas las categorías</option>
//           {Object.values(Category).map((c) => (
//             <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
//           ))}
//         </select>
//       </div>

//       {/* Botón para Limpiar */}
//       <button 
//         onClick={() => router.push("/dashboard/tickets")}
//         className="text-xs text-slate-500 hover:text-brand-600 transition-colors pb-2 underline"
//       >
//         Limpiar filtros
//       </button>
//     </div>
//   );
// }
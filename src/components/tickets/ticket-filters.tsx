// src/components/tickets/ticket-filters.tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { TicketStatus, TicketCategory } from "@prisma/client";
import { FilterX, Search, LayoutGrid } from "lucide-react";

interface TicketFiltersProps {
  statuses: TicketStatus[];
  categories: TicketCategory[];
}

export default function TicketFilters({ statuses, categories }: TicketFiltersProps) {
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
    <div className="bg-white dark:bg-slate-900 p-2 lg:!p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
      <div className="grid grid-cols-2 lg:!flex lg:!flex-row gap-2 lg:!gap-4 lg:!items-end">
        
        {/* Filtro de Estado Dinámico */}
        <div className="flex flex-col gap-2 lg:flex-1">
          <label className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-widest flex items-center gap-1.5 ml-1 truncate">
            <Search size={12} className="text-brand-500 flex-shrink-0" /> 
            Estado
          </label>
          <select 
            value={searchParams.get("status") || ""} 
            onChange={(e) => updateFilter("status", e.target.value)}
            className="form-input py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 cursor-pointer w-full"
          >
            <option value="">Todos los estados</option>
            {statuses.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro de Categoría Dinámica */}
        <div className="flex flex-col gap-2 lg:flex-1">
          <label className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-widest flex items-center gap-1.5 ml-1 truncate">
            <LayoutGrid size={12} className="text-brand-500 flex-shrink-0" /> 
            Categoría
          </label>
          <select 
            value={searchParams.get("category") || ""} 
            onChange={(e) => updateFilter("category", e.target.value)}
            className="form-input py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 cursor-pointer w-full"
          >
            <option value="">Todas las categorías</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Botón Limpiar */}
        <button 
          onClick={() => router.push("/dashboard/tickets")}
          className="col-span-2 sm:col-span-1 w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 transition-all border border-slate-100 dark:border-slate-800 sm:border-transparent hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl"
        >
          <FilterX size={14} />
          <span>Limpiar Filtros</span>
        </button>
      </div>
    </div>
  );
}

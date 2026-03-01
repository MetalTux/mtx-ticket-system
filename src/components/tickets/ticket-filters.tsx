// // src/components/tickets/ticket-filters.tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { STATUS_LABELS, CATEGORY_LABELS } from "@/enums/constantes";
import { TicketStatus, Category } from "@prisma/client";
import { FilterX, Search, LayoutGrid } from "lucide-react";

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
    <div className="bg-white dark:bg-slate-900 p-2 lg:!p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
      {/* Contenedor Principal: Grid de 2 columnas en móvil, Flex en escritorio */}
      <div className="grid grid-cols-2 lg:!flex lg:!flex-row gap-2 lg:!gap-4 lg:!items-end">
        
        {/* Filtro de Estado - Ocupa 1 columna en móvil */}
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
            <option value="">Todos</option>
            {Object.values(TicketStatus).map((s) => (
              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
            ))}
          </select>
        </div>

        {/* Filtro de Categoría - Ocupa 1 columna en móvil */}
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
            <option value="">Todas</option>
            {Object.values(Category).map((c) => (
              <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
            ))}
          </select>
        </div>

        {/* Botón Limpiar - Ocupa las 2 columnas en móvil, ancho automático en escritorio */}
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
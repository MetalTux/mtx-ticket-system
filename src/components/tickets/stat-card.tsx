export function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-white dark:bg-slate-900 p-1.5 lg:p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between transition-colors">
      <div className="min-w-0">
        {/* Label: Más pequeño y apretado en móvil */}
        <p className="text-[7px] lg:text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-widest truncate">
          {label}
        </p>
        {/* Valor: XL en móvil, 2XL en escritorio */}
        <p className="text-[13px] lg:text-2xl font-black text-slate-900 dark:text-white leading-none mt-0.25">
          {value}
        </p>
      </div>
      
      {/* Indicador lateral: Un poco más delgado en móvil para no robar espacio */}
      <div className={`w-1 lg:w-1.5 h-7 lg:h-10 rounded-full ${color} opacity-30 flex-shrink-0 ml-2`} />
    </div>
  );
}
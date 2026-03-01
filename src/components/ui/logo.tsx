// src/components/ui/logo.tsx
import NexoIcon from "./nexo-icon";

export default function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <NexoIcon className="w-10 h-10" />
      
      <div className="flex flex-col leading-none">
        <h2 className="text-2xl lg:text-3xl font-black tracking-tighter text-slate-900 dark:text-white uppercase leading-none">
          Nexo<span className="text-nexo-dark dark:text-nexo-light italic">Ops</span>
        </h2>
        <div className="flex items-center gap-1.5 mt-1">
          <div className="h-[2px] w-4 bg-nexo-dark dark:bg-nexo-light rounded-full"></div>
          <span className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">
            Soporte y Proyectos
          </span>
        </div>
      </div>
    </div>
  );
}
// src/components/ui/logo.tsx
import GTIcon from "./gt-icon";

export default function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <GTIcon className="w-10 h-10" />
      <div className="flex flex-col -space-y-1">
        <h1 className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white uppercase">
          GT<span className="text-nexo-dark dark:text-nexo-light italic">Soft</span>
        </h1>
        <p className="text-[9px] font-bold tracking-[0.4em] text-slate-400 uppercase pl-0.5">
          Systems
        </p>
      </div>
    </div>
  );
}

// // src/components/ui/logo.tsx
// import NexoIcon from "./nexo-icon";

// export default function Logo({ className = "" }: { className?: string }) {
//   return (
//     <div className={`flex items-center gap-3 ${className}`}>
//       <NexoIcon className="w-10 h-10" />
      
//       <div className="flex flex-col leading-none">
//         <h2 className="text-2xl lg:text-3xl font-black tracking-tighter text-slate-900 dark:text-white uppercase leading-none">
//           Nexo<span className="text-nexo-dark dark:text-nexo-light italic">Ops</span>
//         </h2>
//         <div className="flex items-center gap-1.5 mt-1">
//           <div className="h-[2px] w-4 bg-nexo-dark dark:bg-nexo-light rounded-full"></div>
//           <span className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">
//             Soporte y Proyectos
//           </span>
//         </div>
//       </div>
//     </div>
//   );
// }
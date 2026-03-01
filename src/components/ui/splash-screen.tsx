// src/components/ui/splash-screen.tsx
import NexoIcon from "./nexo-icon";

export default function SplashScreen() {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white dark:bg-slate-950 transition-colors duration-500">
      <div className="relative">
        {/* Efecto de pulso radial de fondo */}
        <div className="absolute inset-0 bg-nexo-light/20 dark:bg-nexo-light/10 rounded-full blur-2xl animate-pulse scale-150" />
        
        {/* El Icono con animación de escala y opacidad */}
        <div className="relative animate-bounce duration-[2000ms]">
          <NexoIcon className="w-20 h-20 md:w-24 md:h-24" />
        </div>
      </div>

      {/* Texto de carga */}
      <div className="mt-8 flex flex-col items-center gap-2">
        <h2 className="text-xl font-black tracking-tighter text-slate-900 dark:text-white uppercase animate-pulse">
          Nexo<span className="text-nexo-dark dark:text-nexo-light italic">Ops</span>
        </h2>
        <div className="w-32 h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-nexo-dark dark:bg-nexo-light w-full animate-[loading_1.5s_ease-in-out_infinite] origin-left" />
        </div>
      </div>

      <style jsx>{`
        @keyframes loading {
          0% { transform: scaleX(0); }
          50% { transform: scaleX(1); }
          100% { transform: scaleX(0); transform-origin: right; }
        }
      `}</style>
    </div>
  );
}
// src/app/dashboard/users/loading.tsx
export default function LoadingUsers() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Cabecera Sincronizada: Título a la izquierda, Botón a la derecha */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-slate-200 dark:bg-slate-800 rounded-lg" />
          <div className="h-4 w-48 bg-slate-100 dark:bg-slate-800/50 rounded" />
        </div>
        <div className="h-11 w-44 bg-slate-200 dark:bg-slate-800 rounded-xl" />
      </div>

      {/* Tabla Skeleton */}
      <div className="card-module p-0 overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="h-12 w-full bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800" />
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800" />
                <div className="space-y-2">
                  <div className="h-3 w-32 bg-slate-200 dark:bg-slate-800 rounded" />
                  <div className="h-2.5 w-40 bg-slate-100 dark:bg-slate-800/50 rounded" />
                </div>
              </div>
              <div className="hidden md:block h-6 w-20 bg-slate-100 dark:bg-slate-800 rounded-md" />
              <div className="h-7 w-16 bg-slate-50 dark:bg-slate-800/50 rounded-full" />
              <div className="h-8 w-20 bg-slate-50 dark:bg-slate-800/50 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
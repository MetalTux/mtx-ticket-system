// src/app/dashboard/tickets/loading.tsx
export default function LoadingTickets() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="h-10 w-40 bg-slate-200 dark:bg-slate-800 rounded" />
      </div>

      {/* Esqueleto de Filtros */}
      <div className="h-20 w-full bg-slate-100 dark:bg-slate-900/50 rounded-lg" />

      {/* Esqueleto de Tabla */}
      <div className="card-module overflow-hidden border border-slate-200 dark:border-slate-800">
        <div className="h-12 bg-slate-50 dark:bg-slate-900/80 border-b dark:border-slate-800" />
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex items-center p-4 border-b dark:border-slate-800 space-x-4">
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 bg-slate-100 dark:bg-slate-800 rounded" />
              <div className="h-3 w-1/4 bg-slate-50 dark:bg-slate-900 rounded" />
            </div>
            <div className="h-6 w-20 bg-slate-100 dark:bg-slate-800 rounded-full" />
            <div className="h-6 w-20 bg-slate-100 dark:bg-slate-800 rounded" />
            <div className="h-8 w-12 bg-slate-100 dark:bg-slate-800 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
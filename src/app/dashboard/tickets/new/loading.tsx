// src/app/dashboard/tickets/new/loading.tsx
export default function LoadingNewTicket() {
  return (
    <div className="max-w-3xl mx-auto py-10 px-4 animate-pulse">
      {/* Título Skeleton */}
      <div className="h-9 w-64 bg-slate-200 dark:bg-slate-800 rounded-lg mb-8" />

      {/* Botón Volver Skeleton */}
      <div className="h-5 w-32 bg-slate-100 dark:bg-slate-800/50 rounded mb-6" />

      {/* Card Formulario Skeleton */}
      <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-8">
        
        {/* Fila: Empresa y Contacto */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="h-3 w-24 bg-slate-100 dark:bg-slate-800 rounded" />
            <div className="h-10 w-full bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800" />
          </div>
          <div className="space-y-2">
            <div className="h-3 w-24 bg-slate-100 dark:bg-slate-800 rounded" />
            <div className="h-10 w-full bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800" />
          </div>
        </div>

        {/* Fila: Categoría y Prioridad */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="h-3 w-20 bg-slate-100 dark:bg-slate-800 rounded" />
            <div className="h-10 w-full bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800" />
          </div>
          <div className="space-y-2">
            <div className="h-3 w-20 bg-slate-100 dark:bg-slate-800 rounded" />
            <div className="h-10 w-full bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800" />
          </div>
        </div>

        {/* Campo: Título */}
        <div className="space-y-2">
          <div className="h-3 w-32 bg-slate-100 dark:bg-slate-800 rounded" />
          <div className="h-10 w-full bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800" />
        </div>

        {/* Campo: Editor (Más grande) */}
        <div className="space-y-2">
          <div className="h-3 w-32 bg-slate-100 dark:bg-slate-800 rounded" />
          <div className="h-40 w-full bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800" />
        </div>

        {/* Botón Final */}
        <div className="h-12 w-full bg-slate-200 dark:bg-slate-800 rounded-xl" />
      </div>
    </div>
  );
}
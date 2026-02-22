// src/app/dashboard/users/[id]/edit/loading.tsx
export default function LoadingUserForm() {
  return (
    /* Añadimos max-w-3xl mx-auto para centrarlo igual que la página funcional */
    <div className="max-w-3xl mx-auto py-10 px-4 space-y-4 animate-pulse">
      {/* Botón Volver */}
      <div className="h-5 w-32 bg-slate-100 dark:bg-slate-800/50 rounded" />

      {/* Card Formulario */}
      <div className="card-module space-y-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-2xl shadow-sm">
        {/* Header del Form */}
        <div className="space-y-3 border-b border-slate-100 dark:border-slate-800 pb-6">
          <div className="h-8 w-64 bg-slate-200 dark:bg-slate-800 rounded-lg" />
          <div className="h-4 w-full max-w-sm bg-slate-100 dark:bg-slate-800/50 rounded" />
        </div>

        {/* Grid de Inputs (2 columnas en md) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="h-3 w-24 bg-slate-100 dark:bg-slate-800 rounded" />
              <div className="h-11 w-full bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800" />
            </div>
          ))}
        </div>

        {/* Bloque de Estado (Switch) */}
        <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <div className="space-y-2">
            <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded" />
            <div className="h-3 w-48 bg-slate-100 dark:bg-slate-800/50 rounded" />
          </div>
          <div className="h-6 w-11 bg-slate-200 dark:bg-slate-800 rounded-full" />
        </div>

        {/* Botón Acción Principal */}
        <div className="h-14 w-full bg-slate-200 dark:bg-slate-800 rounded-xl mt-4" />
      </div>
    </div>
  );
}
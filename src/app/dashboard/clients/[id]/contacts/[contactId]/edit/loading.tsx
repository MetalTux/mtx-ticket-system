// src/app/dashboard/clients/[id]/contacts/[contactId]/edit/loading.tsx
export default function LoadingEditContact() {
  return (
    <div className="max-w-3xl mx-auto py-10 space-y-8 animate-pulse">
      {/* Link de retroceso */}
      <div className="h-5 w-40 bg-slate-100 dark:bg-slate-800/50 rounded" />
      
      {/* Título y subtítulo */}
      <div className="space-y-3">
        <div className="h-9 w-64 bg-slate-200 dark:bg-slate-800 rounded-lg" />
        <div className="h-4 w-full max-w-sm bg-slate-100 dark:bg-slate-800/50 rounded" />
      </div>

      {/* Card del Formulario */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-2xl shadow-sm space-y-6">
        {/* Info Box de Empresa */}
        <div className="h-16 w-full bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800" />
        
        {/* Grid Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="h-3 w-20 bg-slate-100 dark:bg-slate-800 rounded" />
            <div className="h-11 w-full bg-slate-50 dark:bg-slate-800/40 rounded-lg" />
          </div>
          <div className="space-y-2">
            <div className="h-3 w-20 bg-slate-100 dark:bg-slate-800 rounded" />
            <div className="h-11 w-full bg-slate-50 dark:bg-slate-800/40 rounded-lg" />
          </div>
        </div>

        {/* Input Contraseña */}
        <div className="space-y-2">
          <div className="h-3 w-32 bg-slate-100 dark:bg-slate-800 rounded" />
          <div className="h-11 w-full bg-slate-50 dark:bg-slate-800/40 rounded-lg" />
        </div>

        {/* Checkbox block */}
        <div className="h-14 w-full bg-slate-50 dark:bg-slate-800/40 rounded-xl" />

        {/* Botón */}
        <div className="flex justify-end">
          <div className="h-12 w-40 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
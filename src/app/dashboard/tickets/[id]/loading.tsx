// src/app/dashboard/tickets/[id]/loading.tsx
export default function LoadingTicket() {
  return (
    <div className="max-w-5xl mx-auto space-y-8 py-8 animate-pulse">
      {/* Skeleton de la cabecera */}
      <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded mb-4" />
      
      <div className="card-module space-y-6">
        <div className="h-8 w-3/4 bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="h-20 w-full bg-slate-100 dark:bg-slate-900 rounded" />
      </div>

      {/* Skeleton de la línea de tiempo */}
      <div className="space-y-4">
        <div className="h-6 w-48 bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="h-32 w-full bg-slate-50 dark:bg-slate-900/50 rounded" />
        <div className="h-32 w-full bg-slate-50 dark:bg-slate-900/50 rounded" />
      </div>
    </div>
  );
}
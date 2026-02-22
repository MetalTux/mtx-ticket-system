// src/app/dashboard/clients/loading.tsx
export default function LoadingClients() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-slate-200 dark:bg-slate-800 rounded-lg" />
          <div className="h-4 w-48 bg-slate-100 dark:bg-slate-800/50 rounded" />
        </div>
        <div className="h-11 w-44 bg-slate-200 dark:bg-slate-800 rounded-xl" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="h-6 w-3/4 bg-slate-200 dark:bg-slate-800 rounded" />
            <div className="h-4 w-1/4 bg-slate-100 dark:bg-slate-800/50 rounded-full" />
            <div className="flex gap-4 pt-4">
              <div className="h-4 w-20 bg-slate-100 dark:bg-slate-800 rounded" />
              <div className="h-4 w-20 bg-slate-100 dark:bg-slate-800 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
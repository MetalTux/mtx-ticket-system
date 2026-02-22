// src/app/dashboard/clients/[id]/loading.tsx
export default function LoadingClientDetail() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="h-5 w-32 bg-slate-100 dark:bg-slate-800 rounded" />
        <div className="h-9 w-36 bg-slate-100 dark:bg-slate-800 rounded-lg" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="h-32 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800" />
          <div className="h-96 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800" />
        </div>
        <div className="space-y-6">
          <div className="h-40 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          <div className="h-48 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800" />
        </div>
      </div>
    </div>
  );
}
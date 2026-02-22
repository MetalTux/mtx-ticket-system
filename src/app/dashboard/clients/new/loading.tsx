// src/app/dashboard/clients/new/loading.tsx
export default function LoadingClientForm() {
  return (
    <div className="max-w-2xl mx-auto py-10 space-y-8 animate-pulse">
      <div className="h-5 w-32 bg-slate-100 dark:bg-slate-800 rounded" />
      <div className="h-8 w-80 bg-slate-200 dark:bg-slate-800 rounded-lg" />
      <div className="h-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl" />
    </div>
  );
}
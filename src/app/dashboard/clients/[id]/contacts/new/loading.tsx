// src/app/dashboard/clients/[id]/contacts/new/loading.tsx
export default function LoadingContactForm() {
  return (
    <div className="max-w-3xl mx-auto py-10 space-y-8 animate-pulse">
      <div className="h-5 w-32 bg-slate-100 dark:bg-slate-800 rounded" />
      <div className="h-8 w-64 bg-slate-200 dark:bg-slate-800 rounded-lg" />
      <div className="h-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl" />
    </div>
  );
}
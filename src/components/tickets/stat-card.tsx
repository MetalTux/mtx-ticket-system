export function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
      <div>
        <p className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">{label}</p>
        <p className="text-2xl font-black text-slate-900 dark:text-white">{value}</p>
      </div>
      <div className={`w-2 h-10 rounded-full ${color} opacity-20`} />
    </div>
  );
}
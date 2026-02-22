// src/components/dashboard/stats-cards.tsx
import { 
  TicketCheck, 
  Clock, 
  AlertTriangle, 
  Plus, 
  LayoutDashboard 
} from "lucide-react";
import Link from "next/link";

interface StatsProps {
  total: number;
  pending: number;
  urgent: number;
  resolvedToday: number;
}

export default function StatsCards({ stats }: { stats: StatsProps }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {/* Botón de Acción Principal */}
      <Link 
        href="/dashboard/tickets/new" 
        className="group relative overflow-hidden bg-brand-600 hover:bg-brand-700 p-5 rounded-2xl transition-all shadow-lg hover:shadow-brand-500/40 flex flex-col justify-between border border-brand-500/50"
      >
        <div className="absolute -right-4 -top-4 text-white/10 group-hover:scale-125 group-hover:-rotate-12 transition-all duration-500">
          <Plus size={100} strokeWidth={3} />
        </div>
        <div className="bg-white/20 w-10 h-10 rounded-xl flex items-center justify-center text-white mb-4">
          <Plus size={24} strokeWidth={3} />
        </div>
        <span className="text-white font-black text-xl leading-tight tracking-tighter uppercase">Nuevo<br/>Ticket</span>
      </Link>

      {/* Widget: Total Activos */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all">
        <div className="flex justify-between items-start">
          <div className="p-2.5 bg-blue-50 dark:bg-blue-500/10 rounded-xl text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-500/20">
            <LayoutDashboard size={20} />
          </div>
        </div>
        <div className="mt-4">
          <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{stats.total}</p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-widest mt-1">Tickets Activos</p>
        </div>
      </div>

      {/* Widget: Pendientes */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all">
        <div className="flex justify-between items-start">
          <div className="p-2.5 bg-amber-50 dark:bg-amber-500/10 rounded-xl text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-500/20">
            <Clock size={20} />
          </div>
        </div>
        <div className="mt-4">
          <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{stats.pending}</p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-widest mt-1">Sin Asignar</p>
        </div>
      </div>

      {/* Widget: Urgentes */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all">
        <div className="flex justify-between items-start">
          <div className="p-2.5 bg-red-50 dark:bg-red-500/10 rounded-xl text-red-600 dark:text-red-400 border border-red-100 dark:border-red-500/20">
            <AlertTriangle size={20} />
          </div>
        </div>
        <div className="mt-4">
          <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{stats.urgent}</p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-widest mt-1">Prioridad Crítica</p>
        </div>
      </div>

      {/* Widget: Resueltos */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all">
        <div className="flex justify-between items-start">
          <div className="p-2.5 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20">
            <TicketCheck size={20} />
          </div>
        </div>
        <div className="mt-4">
          <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{stats.resolvedToday}</p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-widest mt-1">Resueltos Hoy</p>
        </div>
      </div>
    </div>
  );
}
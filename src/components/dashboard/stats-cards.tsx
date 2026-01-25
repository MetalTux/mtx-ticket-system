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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {/* Botón de Acción Principal */}
      <Link 
        href="/dashboard/tickets/new" 
        className="group relative overflow-hidden bg-brand-600 hover:bg-brand-700 p-4 rounded-2xl transition-all shadow-lg hover:shadow-brand-500/20 flex flex-col justify-between"
      >
        {/* <div className="absolute -right-2 -top-2 text-white/10 group-hover:scale-110 transition-transform">
          <Plus size={80} strokeWidth={3} />
        </div> */}
        <Plus className="text-white mb-2" size={24} />
        <span className="text-white font-bold text-lg leading-tight">Nuevo Ticket</span>
      </Link>

      {/* Widget: Total Activos */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600">
            <LayoutDashboard size={20} />
          </div>
        </div>
        <div className="mt-4">
          <p className="text-2xl font-black text-slate-900 dark:text-white">{stats.total}</p>
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Tickets Activos</p>
        </div>
      </div>

      {/* Widget: Pendientes */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-amber-600">
            <Clock size={20} />
          </div>
        </div>
        <div className="mt-4">
          <p className="text-2xl font-black text-slate-900 dark:text-white">{stats.pending}</p>
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Sin Asignar</p>
        </div>
      </div>

      {/* Widget: Urgentes */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-600">
            <AlertTriangle size={20} />
          </div>
        </div>
        <div className="mt-4">
          <p className="text-2xl font-black text-slate-900 dark:text-white">{stats.urgent}</p>
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Prioridad Crítica</p>
        </div>
      </div>

      {/* Widget: Resueltos */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg text-emerald-600">
            <TicketCheck size={20} />
          </div>
        </div>
        <div className="mt-4">
          <p className="text-2xl font-black text-slate-900 dark:text-white">{stats.resolvedToday}</p>
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Resueltos Hoy</p>
        </div>
      </div>
    </div>
  );
}
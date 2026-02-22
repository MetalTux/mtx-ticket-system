// src/components/dashboard/tickets-trend-chart.tsx
"use client";

import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";

interface TrendData {
  date: string;
  abiertos: number;
  resueltos: number;
}

export default function TicketsTrendChart({ data }: { data: TrendData[] }) {
  return (
    <div className="card-module p-6 h-[350px] w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl transition-all duration-300">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 dark:text-slate-200">
            Flujo de Requerimientos
          </h3>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter opacity-70">Últimos 7 días de actividad real</p>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-brand-500 shadow-[0_0_8px_rgba(14,165,233,0.4)]" />
            <span className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Abiertos</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-700" />
            <span className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Resueltos</span>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height="80%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
          <defs>
            <linearGradient id="colorAbiertos" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid 
            strokeDasharray="3 3" 
            vertical={false} 
            stroke="#e2e8f0" 
            className="dark:stroke-slate-800/50" 
          />
          <XAxis 
            dataKey="date" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 10, fontWeight: 800, fill: '#94a3b8' }}
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 10, fontWeight: 800, fill: '#94a3b8' }}
          />
          <Tooltip 
            cursor={{ stroke: '#0ea5e9', strokeWidth: 1 }}
            contentStyle={{ 
              backgroundColor: 'rgb(15 23 42)', 
              border: '1px solid rgb(30 41 59)', 
              borderRadius: '12px',
              fontSize: '11px',
              fontWeight: '800',
              color: '#fff',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)'
            }}
            itemStyle={{ color: '#fff', textTransform: 'uppercase' }}
          />
          <Area 
            type="monotone" 
            dataKey="abiertos" 
            stroke="#0ea5e9" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorAbiertos)" 
            animationDuration={1500}
          />
          <Area 
            type="monotone" 
            dataKey="resueltos" 
            stroke="#94a3b8" 
            strokeWidth={2}
            strokeDasharray="5 5"
            fill="transparent" 
            animationDuration={1500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
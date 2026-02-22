// src/components/dashboard/category-distribution-chart.tsx
"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface CategoryData {
  name: string;
  value: number;
  color: string;
}

export default function CategoryDistributionChart({ data }: { data: CategoryData[] }) {
  // Verificamos si hay datos para evitar divisiones por cero visuales
  const hasData = data.length > 0 && data.some(d => d.value > 0);

  return (
    <div className="card-module p-6 h-[350px] w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl transition-all duration-300">
      <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 dark:text-slate-200 mb-1">
        Por Categoría
      </h3>
      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter opacity-70 mb-4">Distribución de carga</p>

      <div className="h-48 relative">
        {!hasData && (
          <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-slate-400 uppercase">
            Sin datos suficientes
          </div>
        )}
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={hasData ? data : [{ name: 'N/A', value: 1, color: '#e2e8f0' }]}
              innerRadius={65}
              outerRadius={85}
              paddingAngle={8}
              dataKey="value"
              stroke="none"
              animationBegin={0}
              animationDuration={1200}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color} 
                  className="hover:opacity-80 transition-opacity cursor-pointer"
                />
              ))}
              {!hasData && <Cell fill="#e2e8f0" className="dark:fill-slate-800" />}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgb(15 23 42)', 
                border: 'none', 
                borderRadius: '12px',
                fontSize: '11px',
                fontWeight: '800',
                color: '#fff' 
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 space-y-2.5">
        {data.map((item) => (
          <div key={item.name} className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: item.color }} />
              <span className="text-slate-600 dark:text-slate-400">{item.name}</span>
            </div>
            <span className="text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
              {item.value}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
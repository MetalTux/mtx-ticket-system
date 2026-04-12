// src/components/settings/master-table.tsx
"use client";

import { toggleMasterStatus, deleteMaster } from "@/lib/actions/masters-management";
import { toast } from "sonner";
import { Edit2, Trash2, Power, PowerOff } from "lucide-react";
import { AnyMaster, MasterType } from "@/types/masters";

interface MasterTableProps {
  type: MasterType;
  data: AnyMaster[];
  onEdit: (item: AnyMaster) => void;
}

export default function MasterTable({ type, data, onEdit }: MasterTableProps) {
  
  const handleToggle = async (item: AnyMaster) => {
    const res = await toggleMasterStatus(type, item.id, item.isActive ?? true);
    if (res.success) toast.success(`${item.name} actualizado`);
  };

  const handleDelete = async (item: AnyMaster) => {
    if (!confirm(`¿Estás seguro de eliminar "${item.name}"?`)) return;
    const res = await deleteMaster(type, item.id);
    if (res.success) toast.success("Registro eliminado");
    else toast.error(res.error);
  };

  return (
    <div className="card-module !p-0 overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
      <table className="w-full text-left border-collapse">
        <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 text-[10px] font-black uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
          <tr>
            <th className="p-4">Nombre / Detalle</th>
            <th className="p-4">Key / Prefijo</th>
            {type !== 'category' && <th className="p-4">Visual</th>}
            <th className="p-4">Estado</th>
            <th className="p-4 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {data.map((item) => (
            <tr key={item.id} className={`group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors ${!item.isActive ? 'opacity-60' : ''}`}>
              <td className="p-4 font-bold text-slate-900 dark:text-slate-100">{item.name}</td>
              <td className="p-4">
                <code className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded font-bold text-slate-600 dark:text-slate-400">
                  {/* Type guard manual para propiedades específicas */}
                  {'prefix' in item ? item.prefix : item.systemKey}
                </code>
              </td>
              
              {type !== 'category' && 'color' in item && (
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full border border-white dark:border-slate-700" style={{ backgroundColor: item.color }} />
                    <span className="text-[10px] font-medium text-slate-400 uppercase">{item.color}</span>
                  </div>
                </td>
              )}

              <td className="p-4">
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${
                  item.isActive 
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-200' 
                    : 'bg-slate-100 text-slate-500 border-slate-200'
                }`}>
                  {item.isActive ? 'Activo' : 'Inactivo'}
                </span>
              </td>

              <td className="p-4 text-right">
                <div className="flex justify-end gap-2">
                  <button 
                    onClick={() => handleToggle(item)}
                    className={`p-2 rounded-lg transition-colors ${item.isActive ? 'text-emerald-500 hover:bg-emerald-50' : 'text-slate-400 hover:bg-slate-100'}`}
                  >
                    {item.isActive ? <Power size={16} /> : <PowerOff size={16} />}
                  </button>
                  <button onClick={() => onEdit(item)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDelete(item)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
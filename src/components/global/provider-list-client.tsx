// src/components/global/provider-list-client.tsx
"use client";

import { useState } from "react";
import { ProviderCompany } from "@prisma/client";
import { deleteProvider, toggleProviderStatus } from "@/lib/actions/global-management";
import { toast } from "sonner";
import { Edit2, Power, PowerOff, Users, Ticket, Plus } from "lucide-react";
import ProviderFormModal from "./provider-form-modal";
import { Trash2 } from "lucide-react"; // Importar icono

interface ProviderWithStats extends ProviderCompany {
  _count: {
    users: number;
    tickets: number;
  }
}

export default function ProviderListClient({ initialProviders }: { initialProviders: ProviderWithStats[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState<ProviderCompany | null>(null);

  const handleToggle = async (provider: ProviderWithStats) => {
    const res = await toggleProviderStatus(provider.id, provider.isActive);
    if (res.success) toast.success(`Proveedor ${provider.name} actualizado`);
  };

  const openEdit = (provider: ProviderCompany) => {
    setEditingProvider(provider);
    setIsModalOpen(true);
  };

  const openCreate = () => {
    setEditingProvider(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`¿Estás seguro de eliminar permanentemente a "${name}"? Esta acción borrará también a sus usuarios.`)) {
      const res = await deleteProvider(id);
      if (res.success) toast.success("Proveedor eliminado definitivamente");
      else toast.error(res.error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button onClick={openCreate} className="btn-primary flex items-center gap-2 px-4 py-2 text-xs">
          <Plus size={16} /> Dar de Alta Proveedor
        </button>
      </div>

      <div className="card-module !p-0 overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 text-[10px] font-black uppercase tracking-widest border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="p-4">Empresa Proveedora</th>
              <th className="p-4 text-center">Usuarios</th>
              <th className="p-4 text-center">Tickets</th>
              <th className="p-4">Estado</th>
              <th className="p-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {initialProviders.map((p) => (
              <tr key={p.id} className={`group transition-colors ${!p.isActive ? 'opacity-50 bg-slate-50/50' : 'hover:bg-slate-50/30'}`}>
                <td className="p-4">
                  <div className="font-bold text-slate-900 dark:text-slate-100">{p.name}</div>
                  <div className="text-[9px] text-slate-400 font-mono">{p.id}</div>
                </td>
                <td className="p-4 text-center">
                  <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400">
                    <Users size={14} className="text-slate-400" /> {p._count.users}
                  </div>
                </td>
                <td className="p-4 text-center">
                  <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400">
                    <Ticket size={14} className="text-slate-400" /> {p._count.tickets}
                  </div>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${
                    p.isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-red-50 text-red-600 border-red-200'
                  }`}>
                    {p.isActive ? 'Operativo' : 'Suspendido'}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => handleToggle(p)} className={`p-2 rounded-lg transition-colors ${p.isActive ? 'text-red-500 hover:bg-red-50' : 'text-emerald-500 hover:bg-emerald-50'}`}>
                      {p.isActive ? <PowerOff size={18} /> : <Power size={18} />}
                    </button>
                    <button onClick={() => openEdit(p)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg">
                      <Edit2 size={18} />
                    </button>
                    <button onClick={() => handleDelete(p.id, p.name)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar permanentemente">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ProviderFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        initialData={editingProvider} 
      />
    </div>
  );
}
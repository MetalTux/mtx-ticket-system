// src/components/settings/ticket-masters-tabs.tsx
"use client";

import { useState } from "react";
import MasterTable from "./master-table";
import { ListChecks, ShieldAlert, Tags, Plus } from "lucide-react";
import MasterFormModal from "./master-form-modal";
import { TicketMastersResponse, MasterType, AnyMaster } from "@/types/masters"; // Asumiendo que los mueves a un archivo de tipos

export default function TicketMastersTabs({ masters }: { masters: TicketMastersResponse }) {
  const [activeTab, setActiveTab] = useState<MasterType>('status');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AnyMaster | null>(null);

  const handleEdit = (item: AnyMaster) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  // Mapeo dinámico para evitar 'any' en el renderizado
  const activeData = 
    activeTab === 'status' ? masters.statuses :
    activeTab === 'priority' ? masters.priorities :
    masters.categories;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
          <TabButton 
            active={activeTab === 'status'} 
            onClick={() => setActiveTab('status')} 
            icon={<ListChecks size={16}/>} 
            label="Estados" 
          />
          <TabButton 
            active={activeTab === 'priority'} 
            onClick={() => setActiveTab('priority')} 
            icon={<ShieldAlert size={16}/>} 
            label="Prioridades" 
          />
          <TabButton 
            active={activeTab === 'category'} 
            onClick={() => setActiveTab('category')} 
            icon={<Tags size={16}/>} 
            label="Categorías" 
          />
        </div>

        <button onClick={handleAdd} className="btn-primary flex items-center gap-2 py-2 px-4 text-xs shadow-md">
          <Plus size={16} /> Agregar Registro
        </button>
      </div>

      <MasterTable 
        type={activeTab} 
        data={activeData} 
        onEdit={handleEdit}
      />

      {isModalOpen && (
        <MasterFormModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          type={activeTab}
          initialData={editingItem}
        />
      )}
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
        active ? "bg-white dark:bg-slate-900 text-brand-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
      }`}
    >
      {icon} {label}
    </button>
  );
}
// src/components/layout/mobile-header.tsx
"use client";

import { useState } from "react";
import { Menu, X, LayoutDashboard } from "lucide-react";
import Sidebar from "./sidebar";

export default function MobileHeader() {
  const [isOpen, setIsOpen] = useState(false);

  // Función simple para togglear el menú
  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  return (
    <header className="lg:hidden flex items-center justify-between p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 transition-colors">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center shadow-lg shadow-brand-500/20">
          <LayoutDashboard className="text-white w-5 h-5" />
        </div>
        <span className="font-black tracking-tighter text-slate-900 dark:text-white uppercase text-sm">
          Metal<span className="text-brand-600">Tux</span>
        </span>
      </div>

      <button 
        onClick={toggleMenu}
        aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
        className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all active:scale-95"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Menú Lateral Desplegable */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Fondo desenfocado (Backdrop) */}
          <div 
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={closeMenu}
          />
          
          {/* Contenedor del Sidebar */}
          <div className="fixed inset-y-0 left-0 w-64 animate-in slide-in-from-left duration-300 shadow-2xl">
            {/* IMPORTANTE: Pasamos closeMenu a la prop onClose. 
               Como el Sidebar tiene los Links con onClick={onClose}, 
               el menú se cerrará en el momento exacto del clic.
            */}
            <Sidebar 
              className="flex border-none shadow-2xl" 
              onClose={closeMenu} 
            />
          </div>
        </div>
      )}
    </header>
  );
}
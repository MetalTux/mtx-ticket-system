// src/components/ui/loading-button.tsx
"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loadingText?: string;
  variant?: "primary" | "outline" | "danger";
  isLoading?: boolean; // Nueva prop para control manual
}

export default function LoadingButton({ 
  children, 
  loadingText = "Procesando...", 
  variant = "primary",
  className = "",
  isLoading, // Desestructuramos
  ...props 
}: LoadingButtonProps) {
  const { pending } = useFormStatus();
  
  // Si nos pasan isLoading manualmente, lo usamos; si no, usamos el estado del form
  const isActuallyLoading = isLoading !== undefined ? isLoading : pending;

  const variants = {
    primary: "btn-primary",
    outline: "border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200",
    danger: "bg-red-600 hover:bg-red-700 text-white shadow-sm"
  };

  return (
    <button
      {...props}
      disabled={isActuallyLoading || props.disabled}
      className={`${variants[variant]} 
        ${isActuallyLoading ? "pointer-events-none opacity-80" : "cursor-pointer"} 
        flex items-center justify-center gap-2 transition-all ${className}`}
    >
      {isActuallyLoading ? (
        <>
          <Loader2 size={18} className="animate-spin" />
          <span>{loadingText}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
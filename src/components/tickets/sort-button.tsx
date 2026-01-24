// src/components/tickets/sort-button.tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ArrowUpNarrowWide, ArrowDownWideNarrow, ChevronUp } from "lucide-react";

export default function SortButton({ label, column }: { label: string; column: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const currentSort = searchParams.get("sort") || "createdAt";
  const currentOrder = searchParams.get("order") || "desc";
  const isActive = currentSort === column;

  const toggleSort = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", column);
    params.set("order", isActive && currentOrder === "desc" ? "asc" : "desc");
    router.push(`?${params.toString()}`);
  };

  return (
    <button 
      onClick={toggleSort}
      className={`flex items-center gap-1 hover:text-brand-600 transition-colors ${isActive ? "text-brand-600" : ""}`}
    >
      {label}
      {isActive ? (
        currentOrder === "asc" ? <ArrowUpNarrowWide size={14} /> : <ArrowDownWideNarrow size={14} />
      ) : (
        <ChevronUp size={14} className="opacity-20" />
      )}
    </button>
  );
}
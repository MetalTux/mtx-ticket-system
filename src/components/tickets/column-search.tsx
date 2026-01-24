// src/components/tickets/column-search.tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

export default function ColumnSearch({ paramName, placeholder }: { paramName: string, placeholder: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const handleSearch = (term: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (term) {
      params.set(paramName, term);
    } else {
      params.delete(paramName);
    }
    params.set("page", "1");
    
    startTransition(() => {
      router.push(`/dashboard/tickets?${params.toString()}`);
    });
  };

  return (
    <input
      type="text"
      defaultValue={searchParams.get(paramName) || ""}
      onChange={(e) => handleSearch(e.target.value)}
      placeholder={placeholder}
      className={`form-input py-1 px-2 text-[11px] font-normal w-full bg-white dark:bg-slate-800 ${isPending ? "opacity-50" : ""}`}
    />
  );
}
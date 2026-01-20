// src/app/dashboard/layout.tsx
import Sidebar from "@/components/layout/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Sidebar fijo */}
      <Sidebar />

      {/* Contenido Principal con margen para no chocar con el Sidebar */}
      <main className="flex-1 ml-64 p-8">
        {children}
      </main>
    </div>
  );
}
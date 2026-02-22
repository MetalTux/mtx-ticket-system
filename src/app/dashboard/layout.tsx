// src/app/dashboard/layout.tsx
import Sidebar from "@/components/layout/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Sidebar fijo - El Sidebar ya tiene sus clases dark internas */}
      <Sidebar />

      {/* Contenido Principal */}
      <main className="flex-1 ml-64 p-8 min-h-screen">
        <div className="max-w-[1600px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
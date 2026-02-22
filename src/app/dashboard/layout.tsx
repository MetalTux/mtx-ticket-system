// src/app/dashboard/layout.tsx
import Sidebar from "@/components/layout/sidebar";
import MobileHeader from "@/components/layout/mobile-header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Sidebar - Ahora oculto en móviles por defecto mediante clases internas */}
      <Sidebar />

      {/* Contenido Principal */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header para móviles (Solo visible en pantallas < lg) */}
        <MobileHeader />

        <main className="flex-1 p-4 md:p-8 lg:ml-64 min-h-screen transition-all duration-300">
          <div className="max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

// // src/app/dashboard/layout.tsx
// import Sidebar from "@/components/layout/sidebar";

// export default function DashboardLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
//       {/* Sidebar fijo - El Sidebar ya tiene sus clases dark internas */}
//       <Sidebar />

//       {/* Contenido Principal */}
//       <main className="flex-1 ml-64 p-8 min-h-screen">
//         <div className="max-w-[1600px] mx-auto">
//           {children}
//         </div>
//       </main>
//     </div>
//   );
// }
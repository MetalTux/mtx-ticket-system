// src/app/dashboard/layout.tsx
import Sidebar from "@/components/layout/sidebar";
import MobileHeader from "@/components/layout/mobile-header";
import { auth } from "@/auth";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const userData = { name: session?.user?.name, role: session?.user?.role };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* SIDEBAR ESCRITORIO */}
      {/* Usamos 'display: none' y 'display: flex' de forma explícita mediante Tailwind */}
      {/* <div className="hidden lg:block"> */}
        <Sidebar 
          user={userData} 
          className="hidden lg:!flex fixed inset-y-0 left-0 w-64 z-30"
        />
      {/* </div> */}

      {/* CONTENIDO PRINCIPAL */}
      <div className="flex flex-col min-h-screen">
        
        {/* HEADER MÓVIL */}
        {/* Forzamos que desaparezca en escritorio con !hidden (el ! le da prioridad máxima) */}
        <div className="block lg:!hidden sticky top-0 z-40">
          <MobileHeader user={userData} />
        </div>

        {/* MAIN AREA */}
        {/* En escritorio (lg) añadimos margen izquierdo de 16rem (w-64) */}
        <main className="flex-1 w-full lg:pl-64 transition-all">
          <div className="p-4 md:p-8 max-w-[1600px] mx-auto">
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
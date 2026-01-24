import LoginForm from "@/components/auth/login-form";
import { Suspense } from "react";

export default function LoginPage() {
  return (
    /* Cambiamos bg-slate-50 por uno que soporte dark mode */
    <main className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 py-12 transition-colors duration-300">
      <div className="w-full max-w-md">
        {/* Card Principal: Añadimos clases dark: */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              MTX Ticket System
            </h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Bienvenido de nuevo. Por favor, ingresa tus credenciales.
            </p>
          </div>

          <Suspense fallback={<div className="text-center py-4 text-slate-500">Cargando formulario...</div>}>
            <LoginForm />
          </Suspense>

          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Para soporte técnico, contacta al administrador de tu sistema.
            </p>
          </div>
        </div>

        <footer className="mt-8 text-center text-xs text-slate-400 dark:text-slate-500">
          &copy; {new Date().getFullYear()} MetalTux. Todos los derechos reservados.
        </footer>
      </div>
    </main>
  );
}

// // src/app/auth/login/page.tsx

// import LoginForm from "@/components/auth/login-form";
// import { Suspense } from "react";

// export default function LoginPage() {
//   return (
//     <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
//       <div className="w-full max-w-md">
//         {/* Card Principal */}
//         <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
//           <div className="text-center mb-8">
//             <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
//               MTX Ticket System
//             </h1>
//             <p className="mt-2 text-sm text-slate-500">
//               Bienvenido de nuevo. Por favor, ingresa tus credenciales.
//             </p>
//           </div>

//           {/* Formulario envolviendo en Suspense por si usamos hooks de búsqueda */}
//           <Suspense fallback={<div className="text-center py-4">Cargando formulario...</div>}>
//             <LoginForm />
//           </Suspense>

//           <div className="mt-8 pt-6 border-t border-slate-100 text-center">
//             <p className="text-xs text-slate-400">
//               Para soporte técnico, contacta al administrador de tu sistema.
//             </p>
//           </div>
//         </div>

//         {/* Footer opcional fuera del card */}
//         <footer className="mt-8 text-center text-xs text-slate-400">
//           &copy; {new Date().getFullYear()} MetalTux. Todos los derechos reservados.
//         </footer>
//       </div>
//     </main>
//   );
// }
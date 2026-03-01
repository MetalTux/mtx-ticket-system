// src/app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { ourFileRouter } from "@/app/api/uploadthing/core";
import "@uploadthing/react/styles.css";
import { Toaster } from 'sonner';
import "./globals.css";
import ClientLoadingWrapper from "@/components/ui/client-loading-wrapper"; // El nuevo componente

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NexoOps - Gestión Operativa",
  description: "Sistema de Soporte y Proyectos",
  icons: {
    icon: "/icon.svg", 
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased transition-colors duration-300`}
      >
        <NextSSRPlugin routerConfig={extractRouterConfig(ourFileRouter)} />
        
        {/* Envolvemos los hijos en el Splash Screen */}
        <ClientLoadingWrapper>
          {children}
        </ClientLoadingWrapper>

        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}

// // src/app/layout.tsx
// import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google";
// import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
// import { extractRouterConfig } from "uploadthing/server";
// import { ourFileRouter } from "@/app/api/uploadthing/core";
// import "@uploadthing/react/styles.css";
// import { Toaster } from 'sonner';
// import "./globals.css";

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

// export const metadata: Metadata = {
//   title: "NexoOps - Gestión Operativa",
//   description: "Sistema de Soporte y Proyectos",
//   icons: {
//     icon: "/icon.svg", 
//   },
// };

// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   return (
//     <html lang="en" suppressHydrationWarning>
//       <NextSSRPlugin routerConfig={extractRouterConfig(ourFileRouter)} />
//       <body
//         suppressHydrationWarning
//         className={`${geistSans.variable} ${geistMono.variable} bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased transition-colors duration-300`}
//       >
//         {children}
//         <Toaster position="top-right" richColors closeButton />
//       </body>
//     </html>
//   );
// }

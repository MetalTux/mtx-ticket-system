// src/middleware.ts

import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

export default NextAuth(authConfig).auth;

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};


// // src/middleware.ts

// import { auth } from "@/auth";
// import { NextResponse } from "next/server";

// export default auth((req) => {
//   const isLoggedIn = !!req.auth;
//   const { nextUrl } = req;

//   // Definimos rutas públicas (donde se puede entrar sin estar logueado)
//   const isAuthRoute = nextUrl.pathname.startsWith("/auth");
//   const isPublicRoute = nextUrl.pathname === "/"; // Podría ser una landing page

//   if (isAuthRoute) {
//     if (isLoggedIn) {
//       // Si ya está logueado y trata de ir al login, lo mandamos al dashboard
//       return NextResponse.redirect(new URL("/dashboard", nextUrl));
//     }
//     return NextResponse.next();
//   }

//   if (!isLoggedIn && !isPublicRoute) {
//     // Si no está logueado y trata de entrar a una ruta protegida, al login
//     return NextResponse.redirect(new URL("/auth/login", nextUrl));
//   }

//   return NextResponse.next();
// });

// // Configuramos en qué rutas se debe ejecutar este Middleware
// export const config = {
//   matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
// };
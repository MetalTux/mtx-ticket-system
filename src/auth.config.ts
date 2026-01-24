// src/auth.config.ts

import type { NextAuthConfig } from "next-auth";
import { Role } from "@prisma/client";

export const authConfig = {
  secret: process.env.AUTH_SECRET,
  pages: {
    signIn: "/auth/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");
      
      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false;
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.providerId = user.providerId;
        token.clientId = user.clientId;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub as string;
        session.user.role = token.role as Role;
        session.user.providerId = token.providerId as string;
        session.user.clientId = token.clientId as string;
      }
      return session;
    },
  },
  providers: [], // Vacío aquí, se llena en auth.ts
} satisfies NextAuthConfig;
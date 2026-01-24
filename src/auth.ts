// src/auth.ts
import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import db from "@/lib/db";
import { authConfig } from "./auth.config";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcrypt-ts";
import { Adapter } from "@auth/core/adapters";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  // Usamos 'as any' o 'as Adapter' solo si es estrictamente necesario, 
  // pero generalmente el error desaparece si dejamos que NextAuth infiera el adaptador
  // o si sincronizamos las versiones de @auth/core y next-auth.
  adapter: PrismaAdapter(db) as Adapter,
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await db.user.findUnique({
          where: { email: credentials.email as string },
        });

        // Verificamos que el usuario exista, tenga contraseña y esté activo
        if (!user || !user.password || !user.isActive) return null;

        const isPasswordValid = await compare(
          credentials.password as string,
          user.password
        );

        if (!isPasswordValid) return null;

        // Retornamos el usuario con los campos necesarios para el JWT callback
        return {
          id: user.id,
          name: user.name ?? undefined,
          email: user.email,
          role: user.role,
          providerId: user.providerId ?? undefined, // Aquí estaba el error
          clientId: user.clientId ?? undefined,     // También aquí por seguridad
        };
      },
    }),
  ],
});
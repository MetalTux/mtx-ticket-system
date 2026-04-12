// src/auth.ts
import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import db from "@/lib/db";
import { authConfig } from "./auth.config";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcrypt-ts";
import { Adapter } from "@auth/core/adapters";
import { User as NextAuthUser } from "next-auth"; // Importamos el tipo base

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(db) as Adapter,
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await db.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.password || !user.isActive) return null;

        const isPasswordValid = await compare(
          credentials.password as string,
          user.password
        );

        if (!isPasswordValid) return null;

        // Construimos el objeto y lo casteamos correctamente
        // Usamos NextAuthUser para que la función acepte el retorno
        const authenticatedUser: NextAuthUser = {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          providerId: user.providerId ?? undefined,
          clientId: user.clientId ?? undefined,
        };

        return authenticatedUser;
      },
    }),
  ],
});
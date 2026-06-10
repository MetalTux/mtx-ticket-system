// src/auth.ts
import NextAuth, { CredentialsSignin } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import db from "@/lib/db";
import { authConfig } from "./auth.config";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcrypt-ts";
import { Adapter } from "@auth/core/adapters";
import { User as NextAuthUser } from "next-auth";
import * as OTPAuth from "otpauth";

// AÑADIMOS EL CONSTRUCTOR PARA BLINDAR EL CÓDIGO
class NeedTwoFactorError extends CredentialsSignin {
  constructor() {
    super("Se requiere autenticación de dos factores");
    this.code = "2FA_REQUIRED";
  }
}
class InvalidTwoFactorError extends CredentialsSignin {
  constructor() {
    super("Código 2FA inválido o expirado");
    this.code = "2FA_INVALID";
  }
}

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

        // ==========================================
        // NUEVO: LÓGICA DE INTERCEPCIÓN 2FA
        // ==========================================
        if (user.isTwoFactorEnabled) {
          // Extraemos el token si es que el formulario lo envió
          const token = credentials.twoFactorToken as string | undefined;

          // NextAuth a veces convierte los valores nulos al texto "undefined" o "".
          // Si no hay token válido, detenemos el login y avisamos al frontend.
          if (!token || token === "undefined" || token.trim() === "") {
            throw new NeedTwoFactorError();
          }

          // Si mandó el token, lo verificamos matemáticamente
          if (!user.twoFactorSecret) return null;

          const totp = new OTPAuth.TOTP({
            issuer: "GTSoft",
            algorithm: "SHA1",
            digits: 6,
            period: 30,
            secret: OTPAuth.Secret.fromBase32(user.twoFactorSecret),
          });

          const delta = totp.validate({ token, window: 1 });

          // Si el código es incorrecto o expiró, lanzamos error
          if (delta === null) {
            throw new InvalidTwoFactorError();
          }
        }
        // ==========================================

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
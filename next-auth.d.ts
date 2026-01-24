import { DefaultSession } from "next-auth";
import { Role } from "@prisma/client";

declare module "next-auth" {
  interface User {
    role?: Role;
    providerId?: string;
    clientId?: string;
  }

  interface Session {
    user: {
      role?: Role;
      providerId?: string;
      clientId?: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: Role;
    providerId?: string;
    clientId?: string;
  }
}
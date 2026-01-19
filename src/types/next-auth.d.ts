// src/types/next-auth.d.ts

import { Role } from "@prisma/client";
import { DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
      providerId?: string | null;
      clientId?: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    id?: string;
    role: Role;
    providerId?: string | null;
    clientId?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: Role;
    providerId?: string | null;
    clientId?: string | null;
  }
}
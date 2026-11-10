import type { DefaultSession, DefaultUser } from "next-auth";
import type { Role, Tier } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
      memberNumber: string | null;
      tier: Tier | null;
      membershipStatus: string | null;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    role?: Role;
    memberNumber?: string | null;
    tier?: Tier | null;
    membershipStatus?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: Role;
    memberNumber?: string | null;
    tier?: Tier | null;
    membershipStatus?: string | null;
  }
}


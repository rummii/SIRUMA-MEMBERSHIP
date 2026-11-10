import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import type { Role, Tier } from "@prisma/client";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt", maxAge: 60 * 60 * 8 },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      name: "Siruma Membership",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email =
          typeof credentials?.email === "string"
            ? credentials.email.trim().toLowerCase()
            : "";
        const password =
          typeof credentials?.password === "string" ? credentials.password : "";

        if (!email || !password) return null;

        const user = await db.user.findUnique({
          where: { email },
          include: {
            membership: {
              select: { memberNumber: true, tier: true, status: true },
            },
          },
        });

        if (!user) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          memberNumber: user.membership?.memberNumber ?? null,
          tier: user.membership?.tier ?? null,
          membershipStatus: user.membership?.status ?? null,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: Role }).role ?? "MEMBER";
        token.memberNumber =
          (user as { memberNumber?: string | null }).memberNumber ?? null;
        token.tier = (user as { tier?: Tier | null }).tier ?? null;
        token.membershipStatus =
          (user as { membershipStatus?: string | null }).membershipStatus ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) ?? token.sub ?? "";
        session.user.role = (token.role as Role) ?? "MEMBER";
        session.user.memberNumber =
          (token.memberNumber as string | null) ?? null;
        session.user.tier = (token.tier as Tier | null) ?? null;
        session.user.membershipStatus =
          (token.membershipStatus as string | null) ?? null;
      }
      return session;
    },
  },
});


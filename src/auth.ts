import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./lib/prisma";
import type { UserRole } from "@/generated/prisma";
import Google from "next-auth/providers/google";
import {cookies} from "next/headers";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  adapter: PrismaAdapter(prisma),
  session: { strategy: "database" },

  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== "google") return true; // Пропускаем другие провайдеры

      const roleCookie = (await cookies()).get("selected_role");
      if (!roleCookie?.value) return false;

      const role = roleCookie.value as UserRole;

      const dbUser = await prisma.user.findUnique({
        where: { email: user.email! },
      });

      if (!dbUser) {
        return true;
      }

      if (!dbUser.role) {
        await prisma.user.update({
          where: { id: dbUser.id },
          data: { role: role },
        });
      } else if (dbUser.role !== role) {
        return `/login?error=RoleMismatch`;
      }

      (await cookies()).delete("selected_role");
      return true;
    },

    async session({ session, user }) {
      session.user.id = user.id;
      session.user.role = user.role;
      return session;
    },
  },

  events: {
    async createUser(message) {
      const roleCookie = (await cookies()).get("selected_role");
      if (!roleCookie?.value) return;

      await prisma.user.update({
        where: { id: message.user.id },
        data: { role: roleCookie.value as UserRole },
      });

      (await cookies()).delete("selected_role");
    },
  }
});
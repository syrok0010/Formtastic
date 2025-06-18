import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { authConfig } from "./auth.config"
import { prisma } from "./lib/prisma"

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: { strategy: "database" },

  callbacks: {
    async session({ session, user }) {
      session.user.id = user.id;
      return session;
    },
  }
})
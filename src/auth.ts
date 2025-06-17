import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { authConfig } from "./auth.config" // <-- 1. Импортируем базовую конфигурацию

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig, // <-- 2. Используем базовую конфигурацию
  adapter: PrismaAdapter(prisma), // <-- 3. Добавляем адаптер, который работает только в Node.js
  session: { strategy: "database" }, // Важно указать стратегию "database" при использовании адаптера
  
  // Здесь можно добавить или переопределить колбэки, которые требуют доступа к БД
  callbacks: {
    async session({ session, user }) {
      // Добавляем ID пользователя в сессию, чтобы он был доступен везде
      session.user.id = user.id;
      return session;
    },
    // ... другие колбэки
  }
})
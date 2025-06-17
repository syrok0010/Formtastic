import type { NextAuthConfig } from "next-auth"
import Google from "next-auth/providers/google"

// Обратите внимание: экспортируется просто объект конфигурации, а не результат вызова NextAuth()
export const authConfig = {
  // session: { strategy: "database" }, // Можно указать и здесь
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  // Сюда же можно добавить pages, callbacks, events и т.д., если они не используют Prisma
} satisfies NextAuthConfig
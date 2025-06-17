import NextAuth from "next-auth"
import { authConfig } from "./auth.config" // <-- ИМПОРТИРУЕМ ИЗ БЕЗОПАСНОГО ФАЙЛА

export const { auth: middleware } = NextAuth(authConfig)

export const config = {
  // Укажите роуты, которые хотите защитить
  matcher: ["/dashboard/:path*", "/profile"],
}
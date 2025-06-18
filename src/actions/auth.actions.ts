"use server";

import { signIn } from "@/auth";
import { UserRole } from "@/generated/prisma";
import { cookies } from "next/headers";

export async function signInWithRole(role: UserRole) {
    (await cookies()).set("selected_role", role, {
        path: "/",
        maxAge: 60 * 5, // 5 минут
    });

    await signIn("google", { redirectTo: "/" });
}
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import LoginForm from "./login-form";

export default async function LoginPage() {
    const session = await auth();

    if (session) {
        redirect("/");
    }

    return <LoginForm />;
}
import { auth } from "@/auth";
import LoginForm from "@/components/login-form";
import { UserRole } from "@/generated/prisma";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const session = await auth();

  if (!session) return <LoginForm />;

  switch (session.user.id) {
    case UserRole.SURVEY_CREATOR:
      redirect("/admin");
    case UserRole.SURVEY_RESPONDENT:
      redirect("/account");
  }
}

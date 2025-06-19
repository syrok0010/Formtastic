"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ClipboardList, Users } from "lucide-react";
import { UserRole } from "@/generated/prisma";
import { signInWithRole } from "@/actions/auth.actions";
import { useSearchParams } from "next/navigation";

const roles = [
  {
    type: UserRole.SURVEY_CREATOR,
    title: "Я создаю опросы",
    description:
      "Создавайте, настраивайте и публикуйте опросы для сбора мнений.",
    icon: <ClipboardList className="w-12 h-12 mb-4" />,
  },
  {
    type: UserRole.SURVEY_RESPONDENT,
    title: "Я прохожу опросы",
    description:
      "Участвуйте в опросах и делитесь своим мнением по разным темам.",
    icon: <Users className="w-12 h-12 mb-4" />,
  },
];

export default function LoginForm() {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const handleSignIn = async () => {
    if (!selectedRole) return;
    setIsLoading(true);
    await signInWithRole(selectedRole);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-muted/40 p-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">Добро пожаловать!</h1>
        <p className="text-muted-foreground mt-2">
          Для начала, пожалуйста, выберите вашу роль.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-6 mb-8">
        {roles.map((role) => (
          <Card
            key={role.type}
            onClick={() => setSelectedRole(role.type)}
            className={cn(
              "w-72 cursor-pointer transition-all hover:shadow-lg",
              selectedRole === role.type
                ? "border-primary ring-2 ring-primary"
                : "border-border",
            )}
          >
            <CardHeader>
              <CardTitle className="flex flex-col items-center text-center">
                {role.icon}
                {role.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                {role.description}
              </CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>

      {error === "RoleMismatch" && (
        <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md text-center">
          <p className="text-destructive font-medium">Ошибка входа</p>
          <p className="text-sm text-destructive/90">
            Вы уже зарегистрированы с другой ролью. Пожалуйста, выберите роль, с
            которой вы регистрировались ранее.
          </p>
        </div>
      )}

      <div className="h-10">
        {selectedRole && (
          <Button
            onClick={handleSignIn}
            disabled={isLoading}
            size="lg"
            className="animate-in fade-in"
          >
            {isLoading
              ? "Перенаправление..."
              : `Войти с Google как ${selectedRole === "SURVEY_CREATOR" ? "Создатель" : "Респондент"}`}
          </Button>
        )}
      </div>
    </div>
  );
}

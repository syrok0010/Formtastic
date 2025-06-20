import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { UserRole, SurveyStatus } from "@/generated/prisma";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  MoreHorizontal,
  BarChart,
  Pencil,
  FileText,
  Users,
  ListPlus,
  Inbox,
} from "lucide-react";
import { createSurveyAction, getSurveysByCreatorId } from "@/app/admin/actions";
import { ExpandableButton } from "@/components/ui/expandable-button";
import React from "react";
import { DeleteSurveyMenuItem } from "@/app/admin/delete-survey-menu-item";

const SurveyStatusBadge = ({ status }: { status: SurveyStatus }) => {
  switch (status) {
    case SurveyStatus.DRAFT:
      return <Badge variant="secondary">Черновик</Badge>;
    case SurveyStatus.PUBLISHED:
      return (
        <Badge className="bg-green-600 hover:bg-green-700">Опубликован</Badge>
      );
    case SurveyStatus.CLOSED:
      return <Badge variant="destructive">Завершён</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export default async function AllSurveys() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== UserRole.SURVEY_CREATOR) {
    redirect("/");
  }

  const surveys = await getSurveysByCreatorId(session.user.id);

  return (
    <>
      <header className="flex flex-wrap gap-4 items-center justify-between mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Мои опросы</h1>
        <ExpandableButton
          buttonText="Добавить опрос"
          placeholderText="Название нового опроса"
          onSubmitAction={createSurveyAction}
          icon={<ListPlus className="mr-2 h-4 w-4" />}
        />
      </header>

      {surveys.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {surveys.map((survey) => (
            <Link key={survey.id} href={"/admin/" + survey.id + "/edit"}>
              <Card className="flex flex-col h-full cursor-pointer transition-all hover:shadow-lg">
                <CardHeader className="flex flex-row items-start justify-between pb-4">
                  <CardTitle className="text-lg">{survey.title}</CardTitle>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        aria-haspopup="true"
                        size="icon"
                        variant="ghost"
                        className="cursor-pointer"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Открыть меню</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Действия</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <Link href={`/admin/${survey.id}/results`} passHref>
                        <DropdownMenuItem>
                          <BarChart className="mr-2 h-4 w-4" />
                          Результаты
                        </DropdownMenuItem>
                      </Link>
                      <Link href={`/admin/${survey.id}/edit`} passHref>
                        <DropdownMenuItem>
                          <Pencil className="mr-2 h-4 w-4" />
                          Редактировать
                        </DropdownMenuItem>
                      </Link>
                      <DeleteSurveyMenuItem surveyId={survey.id} status={survey.status} />
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>

                <CardContent className="grow space-y-4">
                  <div className="flex justify-around text-base text-muted-foreground">
                    <div className="flex items-center">
                      <FileText className="mr-1.5 h-4 w-4" />
                      {survey._count.questions} Вопросов
                    </div>
                    <div className="flex items-center">
                      <Users className="mr-1.5 h-4 w-4" />
                      {survey._count.responses} Ответов
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="flex justify-between items-center pt-4">
                  <SurveyStatusBadge status={survey.status} />
                  <Badge variant="secondary">
                    {new Date(survey.createdAt).toLocaleDateString("ru-RU")}
                  </Badge>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center col-span-2">
          <Inbox className="h-12 w-12 text-muted-foreground" />
          <h2 className="mt-4 text-xl font-semibold">Опросов пока нет</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Как только вы добавите новый опрос, он появятся здесь.
          </p>
        </div>
      )}
    </>
  );
}

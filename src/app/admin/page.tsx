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
  Trash2,
  FileText,
  Users,
  ListPlus,
} from "lucide-react";
import { createSurveyAction, getSurveysByCreatorId } from "@/app/admin/actions";
import { ExpandableButton } from "@/components/ui/expandable-button";

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
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{survey.title}</CardTitle>
                  </div>
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
                      <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-50">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Удалить
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>

                <CardContent className="flex-grow space-y-4">
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
                  <div className="text-xs text-muted-foreground">
                    {new Date(survey.createdAt).toLocaleDateString("ru-RU")}
                  </div>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        // Состояние, когда опросов еще нет, остается таким же
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-10">
              <h3 className="text-xl font-semibold">Опросов пока нет</h3>
              <p className="text-muted-foreground mt-2">
                Нажмите на кнопку "Создать опрос", чтобы начать.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}

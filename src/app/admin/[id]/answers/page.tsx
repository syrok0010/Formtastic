import { prisma } from "@/lib/prisma";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Inbox } from "lucide-react";
import { SurveyWithResponses } from "@/types/surveyAnswer";
import { UserResponseCard } from "@/components/common/user-response-card";

export default async function SurveyAnswersPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const surveyId = parseInt((await params).id, 10);

  if (isNaN(surveyId)) {
    return (
      <div className="container mx-auto max-w-5xl py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Ошибка</AlertTitle>
          <AlertDescription>Некорректный ID опроса.</AlertDescription>
        </Alert>
      </div>
    );
  }

  const survey: SurveyWithResponses | null = await prisma.survey.findUnique({
    where: { id: surveyId },
    include: {
      questions: {
        include: { options: { orderBy: { order: "asc" } } },
        orderBy: { order: "asc" },
      },
      responses: {
        orderBy: { submittedAt: "desc" },
        include: {
          answers: {
            include: {
              chosenOptions: { select: { optionId: true } },
            },
          },
        },
      },
    },
  });

  if (!survey) {
    return (
      <div className="container mx-auto max-w-5xl py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Ошибка</AlertTitle>
          <AlertDescription>Опрос с ID {surveyId} не найден.</AlertDescription>
        </Alert>
      </div>
    );
  }

  const { questions, responses } = survey;

  const activeResponses = responses.filter(
    (response) => response.answers.length > 0,
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {activeResponses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center col-span-2">
          <Inbox className="h-12 w-12 text-muted-foreground" />
          <h2 className="mt-4 text-xl font-semibold">Ответов пока нет</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Как только пользователи начнут проходить опрос, их ответы появятся
            здесь.
          </p>
        </div>
      ) : (
        <>
          {activeResponses.reverse().map((response, index) => (
            <UserResponseCard
              key={response.id}
              response={response}
              questions={questions}
              cardTitle={`Ответ #${index + 1}`}
            />
          ))}
        </>
      )}
    </div>
  );
}

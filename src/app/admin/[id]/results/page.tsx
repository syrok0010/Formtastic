import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { UserRole } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText } from "lucide-react";
import {
  FullQuestion,
  FullUserResponse,
  SurveyWithResponses,
} from "@/types/surveyAnswer";
import { QuestionResult } from "@/app/admin/[id]/results/question-result";

export type ProcessedQuestion = FullQuestion & {
  answers: FullUserResponse["answers"];
};

export default async function SurveyResultsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== UserRole.SURVEY_CREATOR) {
    redirect("/");
  }

  const surveyId = parseInt((await params).id, 10);
  if (isNaN(surveyId)) {
    redirect("/admin");
  }

  const survey: SurveyWithResponses | null = await prisma.survey.findUnique({
    where: {
      id: surveyId,
      creatorId: session.user.id,
    },
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
    notFound();
  }

  const allAnswers = survey.responses.flatMap((response) => response.answers);
  const processedQuestions: ProcessedQuestion[] = survey.questions.map(
    (question) => ({
      ...question,
      answers: allAnswers.filter((answer) => answer.questionId === question.id),
    }),
  );

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Всего ответов</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{survey.responses.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Вопросов</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{survey.questions.length}</div>
          </CardContent>
        </Card>
      </div>

      <main className="space-y-6">
        {processedQuestions.map((question, index) => (
          <QuestionResult key={question.id} question={question} index={index} />
        ))}
      </main>
    </div>
  );
}

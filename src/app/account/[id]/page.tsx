import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Question, QuestionType, AnswerOption } from "@/generated/prisma";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

const AnswerDisplay = ({
  question,
  answer,
}: {
  question: Question & { options: AnswerOption[] };
  answer: any;
}) => {
  if (answer === null || answer === undefined) {
    return (
      <p className="italic text-muted-foreground">Вы пропустили этот вопрос.</p>
    );
  }

  switch (question.type) {
    case QuestionType.TEXT:
      return (
        <blockquote className="mt-2 border-l-2 pl-6 italic bg-muted/50 py-2 rounded-r-md">
          {answer}
        </blockquote>
      );

    case QuestionType.NUMBER:
      return (
        <p className="font-mono text-lg p-3 bg-muted rounded-md w-fit">
          {answer}
        </p>
      );

    case QuestionType.SINGLE_CHOICE:
    case QuestionType.MULTIPLE_CHOICE:
      const selectedIds = Array.isArray(answer) ? answer : [answer];
      return (
        <div className="space-y-2 mt-4">
          {question.options.map((option) => {
            const isSelected = selectedIds.includes(option.id);
            return (
              <div
                key={option.id}
                className={`flex items-center gap-3 p-3 border rounded-lg transition-colors ${
                  isSelected ? "bg-primary/10 border-primary/50" : "bg-muted/50"
                }`}
              >
                {isSelected && (
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                )}
                <span className={isSelected ? "font-medium" : ""}>
                  {option.text}
                </span>
              </div>
            );
          })}
        </div>
      );

    default:
      return <p>Неподдерживаемый тип ответа.</p>;
  }
};

export default async function CompletedSurveyPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/api/auth/signin");
  }

  const userResponseId = parseInt(params.id, 10);
  if (isNaN(userResponseId)) {
    notFound();
  }

  const userResponse = await prisma.userResponse.findUnique({
    where: {
      id: userResponseId,
      userId: session.user.id,
    },
    include: {
      survey: {
        include: {
          questions: {
            include: { options: { orderBy: { order: "asc" } } },
            orderBy: { order: "asc" },
          },
        },
      },
      answers: {
        include: {
          chosenOptions: { select: { optionId: true } },
        },
      },
    },
  });

  if (!userResponse) {
    notFound();
  }

  const answersMap = userResponse.answers.reduce(
    (acc, answer) => {
      const question = userResponse.survey.questions.find(
        (q) => q.id === answer.questionId,
      );
      if (!question) return acc;

      let value;
      switch (question.type) {
        case QuestionType.TEXT:
          value = answer.textValue;
          break;
        case QuestionType.NUMBER:
          value = answer.numberValue;
          break;
        case QuestionType.SINGLE_CHOICE:
          value = answer.selectedOptionId;
          break;
        case QuestionType.MULTIPLE_CHOICE:
          value = answer.chosenOptions.map((o) => o.optionId);
          break;
        default:
          value = null;
      }
      acc[answer.questionId] = value;
      return acc;
    },
    {} as Record<string, any>,
  );

  const { survey } = userResponse;

  return (
    <>
      <div className="mb-6">
        <Button asChild variant="outline">
          <Link href="/account">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Назад к моим опросам
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">{survey.title}</CardTitle>
          {survey.description && (
            <CardDescription className="text-base pt-2">
              {survey.description}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {survey.questions.map((question, index) => (
              <div
                key={question.id}
                className="pt-6 border-t first:border-t-0 first:pt-0"
              >
                <h3 className="font-semibold text-lg mb-2">
                  <span className="text-muted-foreground">
                    Вопрос {index + 1}:
                  </span>{" "}
                  {question.text}
                </h3>
                <AnswerDisplay
                  question={question}
                  answer={answersMap[question.id]}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
}

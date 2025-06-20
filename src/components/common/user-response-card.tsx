import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AnswerDisplay } from "@/components/common/answer-display";
import { QuestionType } from "@/generated/prisma";
import { FullQuestion, FullUserResponse } from "@/types/surveyAnswer";
import { Badge } from "@/components/ui/badge";

interface UserResponseCardProps {
  response: FullUserResponse;
  questions: FullQuestion[];
  cardTitle: string;
  cardDescription?: string;
}

export function UserResponseCard({
  response,
  questions,
  cardTitle,
  cardDescription,
}: UserResponseCardProps) {
  const answersMap = response.answers.reduce(
    (acc, answer) => {
      const question = questions.find((q) => q.id === answer.questionId);
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

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between">
          <CardTitle>{cardTitle}</CardTitle>
          <Badge variant="secondary">
            {new Date(response.submittedAt).toLocaleDateString("ru-RU")}
          </Badge>
        </div>
        {cardDescription && (
          <CardDescription>{cardDescription}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {questions.map((question, index) => (
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
  );
}

import { QuestionType } from "@/generated/prisma";
import { CheckCircle2 } from "lucide-react";
import { FullQuestion } from "@/types/surveyAnswer";

export function AnswerDisplay({
  question,
  answer,
}: {
  question: FullQuestion;
  answer: any;
}) {
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
}

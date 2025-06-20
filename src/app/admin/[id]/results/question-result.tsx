import { QuestionType } from "@/generated/prisma";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ProcessedQuestion } from "./page";
import { TextResult } from "./text-result";
import { NumberResult } from "@/app/admin/[id]/results/number-result";
import { localizedQuestionTypes } from "@/lib/localization";
import { ChoiceResult } from "@/app/admin/[id]/results/choice-result";

export function QuestionResult({
  question,
  index,
}: {
  question: ProcessedQuestion;
  index: number;
}) {
  const renderResult = () => {
    switch (question.type) {
      case QuestionType.TEXT:
        return <TextResult question={question} />;
      case QuestionType.NUMBER:
        return <NumberResult question={question} />;
      case QuestionType.SINGLE_CHOICE:
      case QuestionType.MULTIPLE_CHOICE:
        return <ChoiceResult question={question} />;
      default:
        return <p>Результаты для этого типа вопроса не поддерживаются.</p>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Вопрос {index + 1}: {question.text}
        </CardTitle>
        <CardDescription>
          Тип: {localizedQuestionTypes[question.type]}
        </CardDescription>
      </CardHeader>
      <CardContent>{renderResult()}</CardContent>
    </Card>
  );
}

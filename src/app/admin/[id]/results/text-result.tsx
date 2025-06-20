import { ScrollArea } from "@/components/ui/scroll-area";
import { ProcessedQuestion } from "./page";

export function TextResult({ question }: { question: ProcessedQuestion }) {
  const textAnswers = question.answers.map((a) => a.textValue).filter(Boolean);

  if (textAnswers.length === 0) {
    return (
      <p className="text-muted-foreground">На этот вопрос пока нет ответов.</p>
    );
  }

  return (
    <ScrollArea className="h-48 rounded-md border p-4">
      <ul className="space-y-2">
        {textAnswers.map((answer, i) => (
          <li key={i} className="text-sm">
            “{answer}”
          </li>
        ))}
      </ul>
    </ScrollArea>
  );
}

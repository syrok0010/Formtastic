"use client";

import { useMemo } from "react";
import { QuestionType } from "@/generated/prisma";
import { BarChart, DonutChart, Legend } from "@tremor/react";
import { ProcessedQuestion } from "./page";

export function ChoiceResult({ question }: { question: ProcessedQuestion }) {
  const chartData = useMemo(() => {
    const counts = new Map<number, number>();
    question.options.forEach((opt) => counts.set(opt.id, 0));

    if (question.type === QuestionType.SINGLE_CHOICE) {
      question.answers.forEach((ans) => {
        if (ans.selectedOptionId) {
          counts.set(
            ans.selectedOptionId,
            (counts.get(ans.selectedOptionId) || 0) + 1,
          );
        }
      });
    } else {
      question.answers.forEach((ans) => {
        ans.chosenOptions.forEach((chosen) => {
          counts.set(chosen.optionId, (counts.get(chosen.optionId) || 0) + 1);
        });
      });
    }

    return question.options
      .map((opt) => ({
        name: opt.text,
        value: counts.get(opt.id) || 0,
      }))
      .sort((a, b) => b.value - a.value);
  }, [question]);

  const totalVotes = chartData.reduce((sum, item) => sum + item.value, 0);

  if (totalVotes === 0) {
    return (
      <p className="text-muted-foreground">На этот вопрос пока нет ответов.</p>
    );
  }

  if (question.type === QuestionType.SINGLE_CHOICE) {
    return (
      <div className="flex items-center justify-center sm:justify-start gap-12 flex-wrap">
        <DonutChart
          data={chartData}
          category="value"
          index="name"
          variant="pie"
          colors={["blue", "cyan", "indigo", "violet", "fuchsia", "pink"]}
          className="w-64 h-64"
        />
        <Legend
          categories={chartData.map((d) => `${d.name} (${d.value})`)}
          colors={["blue", "cyan", "indigo", "violet", "fuchsia", "pink"]}
          className="max-w-xs"
        />
      </div>
    );
  }

  return (
    <div className="h-80">
      <BarChart
        data={chartData}
        layout="vertical"
        index="name"
        categories={["value"]}
        colors={["blue"]}
        yAxisWidth={150}
        showLegend={false}
        valueFormatter={(number: number) => `${number} голосов`}
      />
    </div>
  );
}

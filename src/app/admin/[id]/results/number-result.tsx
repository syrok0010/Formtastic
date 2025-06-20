"use client";

import { useMemo } from "react";
import { BarChart, Card, Title, Grid } from "@tremor/react";
import { ProcessedQuestion } from "./page";

export function NumberResult({ question }: { question: ProcessedQuestion }) {
  const { stats, chartData } = useMemo(() => {
    const numberValues = question.answers
      .map((a) => a.numberValue)
      .filter((v): v is number => v !== null && v !== undefined);

    if (numberValues.length === 0) {
      return { stats: null, chartData: [] };
    }

    const sum = numberValues.reduce((acc, val) => acc + val, 0);
    const average = sum / numberValues.length;
    const min = Math.min(...numberValues);
    const max = Math.max(...numberValues);

    const counts = numberValues.reduce(
      (acc, val) => {
        acc[val] = (acc[val] || 0) + 1;
        return acc;
      },
      {} as Record<number, number>,
    );

    const formattedChartData = Object.entries(counts)
      .map(([name, value]) => ({ name, Количество: value }))
      .sort((a, b) => Number(a.name) - Number(b.name));

    return {
      stats: { average, min, max, count: numberValues.length },
      chartData: formattedChartData,
    };
  }, [question.answers]);

  if (!stats) {
    return (
      <p className="text-muted-foreground">На этот вопрос пока нет ответов.</p>
    );
  }

  return (
    <div>
      <Grid numItemsMd={3} className="gap-6 mb-6">
        <Card>
          <Title>Среднее</Title>
          <p className="text-3xl font-semibold">{stats.average.toFixed(2)}</p>
        </Card>
        <Card>
          <Title>Минимум</Title>
          <p className="text-3xl font-semibold">{stats.min}</p>
        </Card>
        <Card>
          <Title>Максимум</Title>
          <p className="text-3xl font-semibold">{stats.max}</p>
        </Card>
      </Grid>
      <Title>Распределение</Title>
      <BarChart
        className="mt-4 h-72"
        data={chartData}
        index="name"
        categories={["Количество"]}
        colors={["blue"]}
        yAxisWidth={40}
      />
    </div>
  );
}

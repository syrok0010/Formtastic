'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Prisma } from '@/generated/prisma';

import { QuestionCard } from './QuestionCard';
import { ProgressBar } from './ProgressBar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

const surveyWithDetailsQuery = Prisma.validator<Prisma.SurveyDefaultArgs>()({
    include: {
        questions: {
            include: {
                options: {
                    orderBy: { order: 'asc' },
                },
            },
            orderBy: { order: 'asc' },
        },
    },
});
type SurveyWithDetails = Prisma.SurveyGetPayload<typeof surveyWithDetailsQuery>;


export function QuizClientForm({ survey }: { survey: SurveyWithDetails }) {
    const router = useRouter();
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, any>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const currentQuestion = survey.questions[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === survey.questions.length - 1;

    const handleAnswerChange = (answer: any) => {
        setAnswers((prev) => ({
            ...prev,
            [currentQuestion.id]: answer,
        }));
    };

    const handleNext = () => {
        if (!isLastQuestion) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
    };

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        }
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            const response = await fetch('/api/quiz/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    quizId: survey.id,
                    answers: answers,
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Не удалось отправить ответы');
            }

            router.push(`/quiz/${survey.id}/results/${result.userResponseId}`);
        } catch (err: any) {
            setError(err.message);
            setIsSubmitting(false);
        }
    };

    const progressPercentage = ((currentQuestionIndex + 1) / survey.questions.length) * 100;

    return (
        <div className="max-w-3xl mx-auto">
            <form onSubmit={handleSubmit}>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl">{survey.title}</CardTitle>
                        {survey.description && (
                            <p className="text-muted-foreground mt-1">{survey.description}</p>
                        )}
                    </CardHeader>
                    <CardContent className="space-y-8">
                        <ProgressBar
                            current={currentQuestionIndex + 1}
                            total={survey.questions.length}
                            percentage={progressPercentage}
                        />

                        <QuestionCard
                            questionId={currentQuestion.id.toString()}
                            title={currentQuestion.text}
                            required={currentQuestion.isRequired}
                            type={currentQuestion.type as 'single_choice' | 'multiple_choice' | 'text' | 'NUMBER'}
                            options={currentQuestion.options.map(opt => ({ id: opt.id.toString(), text: opt.text }))}
                            answer={answers[currentQuestion.id]}
                            onAnswerChange={handleAnswerChange}
                        />

                        {error && (
                            <Alert variant="destructive">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <div className="flex justify-between items-center pt-4 border-t">
                            <Button type="button" variant="outline" onClick={handlePrevious} disabled={currentQuestionIndex === 0 || isSubmitting}>
                                Назад
                            </Button>

                            {!isLastQuestion ? (
                                <Button type="button" onClick={handleNext}>
                                    Далее
                                </Button>
                            ) : (
                                <Button type="submit" disabled={isSubmitting} size="lg">
                                    {isSubmitting ? 'Отправка...' : 'Завершить опрос'}
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </form>
        </div>
    );
}
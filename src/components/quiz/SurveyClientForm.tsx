'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {AnswerOption, Question, Survey} from '@/generated/prisma';

import { QuestionCard } from './QuestionCard';
import { ProgressBar } from './ProgressBar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {submitSurvey} from "@/app/survey/actions";

export type FullSurvey = Survey & {
    questions: (Question & {
        options: AnswerOption[];
    })[];
};

export function SurveyClientForm({ survey }: { survey: FullSurvey }) {
    const router = useRouter();
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, any>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [validationError, setValidationError] = useState<string | null>(null);
    const [isFinished, setIsFinished] = useState(false);

    const currentQuestion = survey.questions[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === survey.questions.length - 1;

    const handleAnswerChange = (answer: any) => {
        setAnswers((prev) => ({
            ...prev,
            [currentQuestion.id]: answer,
        }));
        setValidationError(null);
    };

    const validateCurrentAnswer = () => {
        if (currentQuestion.isRequired) {
            const answer = answers[currentQuestion.id];
            if (answer === undefined || answer === null || answer === '' || (Array.isArray(answer) && answer.length === 0)) {
                setValidationError('Это обязательный вопрос. Пожалуйста, дайте ответ.');
                return false;
            }
        }
        return true;
    }

    const handleNext = () => {
        if (!validateCurrentAnswer()) return;

        if (!isLastQuestion) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
    };

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        }
    };

    const handleSubmit = async () => {

        if (!validateCurrentAnswer()) return;

        setIsSubmitting(true);
        setError(null);

        try {
            for (const question of survey.questions) {
                if (!answers[question.id]) {
                    answers[question.id] = null;
                }
            }
            const result = await submitSurvey(survey.id, answers);

            if (result.success) {
                console.log('Опрос успешно пройден! ID ответа:', result.userResponseId);
            } else {
                throw new Error(result.error || 'Произошла неизвестная ошибка.');
            }

        } catch (err: any) {
            console.error('Ошибка при отправке опроса:', err);
            setError(err.message);
        } finally {
            setIsSubmitting(false);
            setIsFinished(true);
        }
    };

    const progressPercentage = ((currentQuestionIndex + 1) / survey.questions.length) * 100;

    return (
        <div className="max-w-3xl mx-auto">
            <div>
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
                            question={currentQuestion}
                            answer={answers[currentQuestion.id]}
                            onAnswerChange={handleAnswerChange}
                        />

                        {error && (
                            <Alert variant="destructive">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        {isFinished && (
                            <Alert variant="success">
                                <AlertDescription>Вы успешно завершили опрос</AlertDescription>
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
                                <Button type="button" onClick={handleSubmit} disabled={isSubmitting} size="lg">
                                    {isSubmitting ? 'Отправка...' : 'Завершить опрос'}
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
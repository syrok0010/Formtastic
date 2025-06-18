"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { QuestionCard } from './QuestionCard';
import { ProgressBar } from './ProgressBar';
import { SubmitButton } from './SubmitButton';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

interface Question {
  id: string;
  type: 'single_choice' | 'multiple_choice' | 'text' | 'rating' | 'boolean';
  title: string;
  description?: string;
  required: boolean;
  options?: { id: string; text: string; }[];
  maxRating?: number;
}

interface Quiz {
  id: string;
  title: string;
  description?: string;
  questions: Question[];
  isAnonymous: boolean;
  timeLimit?: number;
  maxResponses?: number;
}

interface QuizContainerProps {
  quizId: string;
  onComplete: (answers: Record<string, any>) => void;
  onError: (error: string) => void;
}

const mockQuiz: Quiz = {
  id: "quiz001",
  title: "Тест по React",
  description: "Проверьте свои знания по React и TypeScript.",
  isAnonymous: true,
  questions: [
    {
      id: "q1",
      type: "single_choice",
      title: "Кто разработал React?",
      required: true,
      options: [
        { id: "a", text: "Facebook" },
        { id: "b", text: "Google" },
        { id: "c", text: "Microsoft" }
      ]
    },
    {
      id: "q2",
      type: "multiple_choice",
      title: "Какие хуки есть в React?",
      required: true,
      options: [
        { id: "a", text: "useState" },
        { id: "b", text: "useEffect" },
        { id: "c", text: "useFetch" }
      ]
    },
    {
      id: "q3",
      type: "text",
      title: "Ваш любимый фреймворк для фронтенда?",
      required: false
    },
    {
      id: "q4",
      type: "rating",
      title: "Оцените свои знания React по шкале от 1 до 5",
      required: true,
      maxRating: 5
    },
    {
      id: "q5",
      type: "boolean",
      title: "Использовали ли вы TypeScript?",
      required: true
    }
  ],
  timeLimit: 3 // минуты
};


export const QuizContainer: React.FC<QuizContainerProps> = ({
  quizId,
  onComplete,
  onError
}) => {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    fetchQuiz();
  }, [quizId]);

  useEffect(() => {
    if (quiz?.timeLimit && timeLeft === null) {
      setTimeLeft(quiz.timeLimit * 60); // Конвертируем минуты в секунды
    }
  }, [quiz]);

  useEffect(() => {
    if (timeLeft && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      handleSubmit();
    }
  }, [timeLeft]);

  // const fetchQuiz = async () => {
  //   try {
  //     setLoading(true);
  //     const response = await fetch(`/api/quiz/${quizId}`);
  //
  //     if (!response.ok) {
  //       throw new Error('Не удалось загрузить опрос');
  //     }
  //
  //     const data = await response.json();
  //     setQuiz(data);
  //     setError(null);
  //   } catch (err) {
  //     const errorMessage = err instanceof Error ? err.message : 'Произошла ошибка';
  //     setError(errorMessage);
  //     onError(errorMessage);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const fetchQuiz = async () => {
    setLoading(true);
    try {
      // Заменяем сетевой запрос на локальные данные
      setQuiz(mockQuiz);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Произошла ошибка';
      setError(errorMessage);
      onError(errorMessage);
    } finally {
      setLoading(false);
    }
  };


  const handleAnswerChange = (questionId: string, answer: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleNext = () => {
    if (quiz && currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!quiz) return;

    setSubmitting(true);
    try {
      const response = await fetch('/api/quiz/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quizId: quiz.id,
          answers,
          timeSpent: quiz.timeLimit ? (quiz.timeLimit * 60 - (timeLeft || 0)) : null
        }),
      });

      if (!response.ok) {
        throw new Error('Не удалось отправить ответы');
      }

      const result = await response.json();
      onComplete(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Произошла ошибка при отправке';
      setError(errorMessage);
      onError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const isLastQuestion = quiz ? currentQuestionIndex === quiz.questions.length - 1 : false;
  const currentQuestion = quiz?.questions[currentQuestionIndex];
  const progress = quiz ? ((currentQuestionIndex + 1) / quiz.questions.length) * 100 : 0;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!quiz || !currentQuestion) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Опрос не найден или недоступен</AlertDescription>
      </Alert>
    );
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{quiz.title}</CardTitle>
              {quiz.description && (
                <p className="text-muted-foreground mt-2">{quiz.description}</p>
              )}
            </div>
            {timeLeft !== null && (
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Осталось времени</p>
                <p className="text-lg font-mono font-bold">
                  {formatTime(timeLeft)}
                </p>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <ProgressBar
              current={currentQuestionIndex + 1}
              total={quiz.questions.length}
              percentage={progress}
            />

            <QuestionCard
              question={currentQuestion}
              answer={answers[currentQuestion.id]}
              onAnswerChange={(answer) => handleAnswerChange(currentQuestion.id, answer)}
            />

            <div className="flex justify-between items-center pt-4">
              <div>
                {currentQuestionIndex > 0 && (
                  <button
                    onClick={handlePrevious}
                    className="px-4 py-2 text-sm border rounded-md hover:bg-gray-50"
                    disabled={submitting}
                  >
                    Назад
                  </button>
                )}
              </div>

              <div className="flex space-x-2">
                {!isLastQuestion ? (
                  <button
                    onClick={handleNext}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    disabled={submitting}
                  >
                    Следующий
                  </button>
                ) : (
                  <SubmitButton
                    onSubmit={handleSubmit}
                    disabled={submitting}
                    loading={submitting}
                  />
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

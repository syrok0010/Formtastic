import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { StatsChart } from './StatsChart';
import { SummaryCard } from './SummaryCard';
import { ShareButton } from './ShareButton';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

interface QuizResult {
  id: string;
  quizTitle: string;
  userScore?: number;
  maxScore?: number;
  completedAt: string;
  timeSpent?: number;
  answers: Array<{
    questionId: string;
    questionText: string;
    userAnswer: any;
    correctAnswer?: any;
    isCorrect?: boolean;
  }>;
}

interface PublicStats {
  totalResponses: number;
  questions: Array<{
    id: string;
    text: string;
    type: string;
    stats: {
      [key: string]: number;
    };
  }>;
}

interface ResultsContainerProps {
  quizId: string;
  responseId?: string;
  showPublicStats?: boolean;
}

export const ResultsContainer: React.FC<ResultsContainerProps> = ({
  quizId,
  responseId,
  showPublicStats = true,
}) => {
  const [result, setResult] = useState<QuizResult | null>(null);
  const [publicStats, setPublicStats] = useState<PublicStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchResults();
  }, [quizId, responseId]);

  const fetchResults = async () => {
    try {
      setLoading(true);

      // Загружаем результаты пользователя
      if (responseId) {
        const userResponse = await fetch(`/api/results/${quizId}/${responseId}`);
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setResult(userData);
        }
      }

      // Загружаем публичную статистику
      if (showPublicStats) {
        const statsResponse = await fetch(`/api/results/${quizId}/stats`);
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setPublicStats(statsData);
        }
      }

      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Произошла ошибка';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

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

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      {/* Заголовок результатов */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">
                Результаты: {result?.quizTitle || 'Опрос завершен'}
              </CardTitle>
              {result?.completedAt && (
                <p className="text-muted-foreground mt-2">
                  Завершено: {new Date(result.completedAt).toLocaleString('ru-RU')}
                </p>
              )}
            </div>
            <ShareButton quizId={quizId} />
          </div>
        </CardHeader>
      </Card>

      {/* Персональные результаты */}
      {result && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <SummaryCard
            title="Ваш результат"
            value={result.userScore !== undefined ? `${result.userScore}/${result.maxScore}` : 'Завершено'}
            subtitle={result.userScore !== undefined ? 
              `${Math.round((result.userScore / (result.maxScore || 1)) * 100)}%` : 
              'Опрос не оценивается'
            }
            type="score"
          />

          {result.timeSpent && (
            <SummaryCard
              title="Время прохождения"
              value={formatTime(result.timeSpent)}
              subtitle="Общее время"
              type="time"
            />
          )}

          {publicStats && (
            <SummaryCard
              title="Участников"
              value={publicStats.totalResponses.toString()}
              subtitle="Всего ответов"
              type="participants"
            />
          )}
        </div>
      )}

      {/* Детальные ответы пользователя */}
      {result && result.answers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Ваши ответы</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {result.answers.map((answer, index) => (
                <div
                  key={answer.questionId}
                  className={`p-4 rounded-lg border ${
                    answer.isCorrect === true
                      ? 'border-green-200 bg-green-50'
                      : answer.isCorrect === false
                      ? 'border-red-200 bg-red-50'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium mb-2">
                        {index + 1}. {answer.questionText}
                      </h4>
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Ваш ответ:</span> {
                          Array.isArray(answer.userAnswer) 
                            ? answer.userAnswer.join(', ')
                            : String(answer.userAnswer)
                        }
                      </p>
                      {answer.correctAnswer && answer.isCorrect === false && (
                        <p className="text-sm text-green-700 mt-1">
                          <span className="font-medium">Правильный ответ:</span> {
                            Array.isArray(answer.correctAnswer)
                              ? answer.correctAnswer.join(', ')
                              : String(answer.correctAnswer)
                          }
                        </p>
                      )}
                    </div>
                    {answer.isCorrect !== undefined && (
                      <div className={`ml-4 ${
                        answer.isCorrect ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {answer.isCorrect ? '✓' : '✗'}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Публичная статистика */}
      {showPublicStats && publicStats && publicStats.questions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Общая статистика</CardTitle>
            <p className="text-muted-foreground">
              Результаты всех участников ({publicStats.totalResponses} ответов)
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {publicStats.questions.map((question) => (
                <div key={question.id}>
                  <h4 className="font-medium mb-4">{question.text}</h4>
                  <StatsChart
                    data={question.stats}
                    type={question.type}
                    totalResponses={publicStats.totalResponses}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

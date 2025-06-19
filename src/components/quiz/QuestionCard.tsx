import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AnswerOptions } from './AnswerOptions';

interface QuestionCardProps {
  questionId: string;
  title: string;
  description?: string;
  required: boolean;
  type: 'single_choice' | 'multiple_choice' | 'text' | 'rating' | 'boolean' | 'NUMBER';
  options?: { id: string; text: string; }[];
  maxRating?: number;
  answer: any;
  onAnswerChange: (answer: any) => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
                                                            questionId,
                                                            title,
                                                            description,
                                                            required,
                                                            type,
                                                            options,
                                                            maxRating,
                                                            answer,
                                                            onAnswerChange,
                                                          }) => {
  return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg flex items-start gap-2">
            <span>{title}</span>
            {required && (
                <span className="text-red-500 text-sm">*</span>
            )}
          </CardTitle>
          {description && (
              <p className="text-sm text-muted-foreground">
                {description}
              </p>
          )}
        </CardHeader>
        <CardContent>
          <AnswerOptions
              questionId={questionId}
              type={type}
              options={options}
              maxRating={maxRating}
              value={answer}
              onChange={onAnswerChange}
          />
        </CardContent>
      </Card>
  );
};
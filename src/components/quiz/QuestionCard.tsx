import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AnswerOptions } from './AnswerOptions';

interface Question {
  id: string;
  type: 'single_choice' | 'multiple_choice' | 'text' | 'rating' | 'boolean';
  title: string;
  description?: string;
  required: boolean;
  options?: { id: string; text: string; }[];
  maxRating?: number;
}

interface QuestionCardProps {
  question: Question;
  answer: any;
  onAnswerChange: (answer: any) => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  answer,
  onAnswerChange,
}) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg flex items-start gap-2">
          <span>{question.title}</span>
          {question.required && (
            <span className="text-red-500 text-sm">*</span>
          )}
        </CardTitle>
        {question.description && (
          <p className="text-sm text-muted-foreground">
            {question.description}
          </p>
        )}
      </CardHeader>
      <CardContent>
        <AnswerOptions
          question={question}
          value={answer}
          onChange={onAnswerChange}
        />
      </CardContent>
    </Card>
  );
};

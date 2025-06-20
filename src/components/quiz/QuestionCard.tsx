import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AnswerOptions } from './AnswerOptions';
import {AnswerOption, Question, QuestionType} from "@/generated/prisma";

type QuestionWithOptions = Question & { options: AnswerOption[] };

interface QuestionCardProps {
    question: QuestionWithOptions;
    answer: any;
    onAnswerChange: (answer: any) => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
                                                            question,
                                                            answer,
                                                            onAnswerChange,
                                                          }) => {
  return (
      <Card className="w-full border-none shadow-none">
          <CardHeader>
              <CardTitle className="text-lg flex items-start gap-2">
                  <span>{question.text}</span>
                  {question.isRequired && <span className="text-red-500 text-sm">*</span>}
              </CardTitle>
          </CardHeader>
          <CardContent>
              <AnswerOptions
                  questionId={question.id.toString()}
                  type={question.type}
                  options={question.options}
                  value={answer}
                  onChange={onAnswerChange}
              />
          </CardContent>
      </Card>
  );
};
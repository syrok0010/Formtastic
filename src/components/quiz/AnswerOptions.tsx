import React from 'react';
import { Input } from '@/components/ui/input';
import {AnswerOption, QuestionType} from "@/generated/prisma";

interface AnswerOptionsProps {
  questionId: string;
  type: QuestionType;
  options?: AnswerOption[];
  value: any;
  onChange: (value: any) => void;
}

export const AnswerOptions: React.FC<AnswerOptionsProps> = ({
                                                              questionId,
                                                              type,
                                                              options,
                                                                value,
                                                                onChange,
                                                            }) => {
  const renderSingleChoice = () => (
      <div className="space-y-3">
        {options?.map((option) => (
            <label key={option.id} className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg border hover:bg-gray-50 transition-colors">
              <input
                  type="radio"
                  name={`question-${questionId}`}
                  value={option.id}
                  checked={value === Number(option.id)}
                  onChange={(e) => onChange(Number(e.target.value))}
                  className="w-4 h-4 text-blue-600"
              />
              <span className="flex-1">{option.text}</span>
            </label>
        ))}
      </div>
  );

  const renderMultipleChoice = () => (
      <div className="space-y-3">
        {options?.map((option) => (
            <label key={option.id} className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg border hover:bg-gray-50 transition-colors">
              <input
                  type="checkbox"
                  value={option.id}
                  checked={Array.isArray(value) && value.includes(Number(option.id))}
                  onChange={(e) => {
                    const optionIdNum = Number(e.target.value);
                    const currentValue = Array.isArray(value) ? value : [];
                    if (e.target.checked) {
                      onChange([...currentValue, optionIdNum]);
                    } else {
                      onChange(currentValue.filter(id => id !== optionIdNum));
                    }
                  }}
                  className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="flex-1">{option.text}</span>
            </label>
        ))}
      </div>
  );

  const renderTextInput = () => (
      <div className="space-y-2">
      <textarea
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Введите ваш ответ..."
          className="w-full min-h-[100px] p-3 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
      </div>
  );

  const renderNumberInput = () => (
      <Input
          type="number"
          value={value || ''}
          onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
          placeholder="Введите число"
      />
  );

  switch (type) {
    case QuestionType.SINGLE_CHOICE:
      return renderSingleChoice();
    case QuestionType.MULTIPLE_CHOICE:
      return renderMultipleChoice();
    case QuestionType.TEXT:
      return renderTextInput();
    case QuestionType.NUMBER:
      return renderNumberInput();
    default:
      return <div>Неподдерживаемый тип вопроса: {type}</div>;
  }
};
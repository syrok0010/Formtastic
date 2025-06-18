import React from 'react';
import { Input } from '@/components/ui/input';

interface Question {
  id: string;
  type: 'single_choice' | 'multiple_choice' | 'text' | 'rating' | 'boolean';
  title: string;
  description?: string;
  required: boolean;
  options?: { id: string; text: string; }[];
  maxRating?: number;
}

interface AnswerOptionsProps {
  question: Question;
  value: any;
  onChange: (value: any) => void;
}

export const AnswerOptions: React.FC<AnswerOptionsProps> = ({
  question,
  value,
  onChange,
}) => {
  const renderSingleChoice = () => (
    <div className="space-y-3">
      {question.options?.map((option) => (
        <label
          key={option.id}
          className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg border hover:bg-gray-50 transition-colors"
        >
          <input
            type="radio"
            name={`question-${question.id}`}
            value={option.id}
            checked={value === option.id}
            onChange={(e) => onChange(e.target.value)}
            className="w-4 h-4 text-blue-600"
          />
          <span className="flex-1">{option.text}</span>
        </label>
      ))}
    </div>
  );

  const renderMultipleChoice = () => (
    <div className="space-y-3">
      {question.options?.map((option) => (
        <label
          key={option.id}
          className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg border hover:bg-gray-50 transition-colors"
        >
          <input
            type="checkbox"
            value={option.id}
            checked={Array.isArray(value) && value.includes(option.id)}
            onChange={(e) => {
              const currentValue = Array.isArray(value) ? value : [];
              if (e.target.checked) {
                onChange([...currentValue, option.id]);
              } else {
                onChange(currentValue.filter(id => id !== option.id));
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

  const renderRatingScale = () => {
    const maxRating = question.maxRating || 5;
    const ratings = Array.from({ length: maxRating }, (_, i) => i + 1);

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">1 - Очень плохо</span>
          <span className="text-sm text-gray-600">{maxRating} - Отлично</span>
        </div>
        <div className="flex justify-center space-x-2">
          {ratings.map((rating) => (
            <button
              key={rating}
              onClick={() => onChange(rating)}
              className={`w-12 h-12 rounded-full border-2 font-semibold transition-colors ${
                value === rating
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
              }`}
            >
              {rating}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderBooleanChoice = () => (
    <div className="flex space-x-4 justify-center">
      <label className="flex items-center space-x-2 cursor-pointer">
        <input
          type="radio"
          name={`question-${question.id}`}
          value="true"
          checked={value === true}
          onChange={() => onChange(true)}
          className="w-4 h-4 text-green-600"
        />
        <span className="text-green-700 font-medium">Да</span>
      </label>
      <label className="flex items-center space-x-2 cursor-pointer">
        <input
          type="radio"
          name={`question-${question.id}`}
          value="false"
          checked={value === false}
          onChange={() => onChange(false)}
          className="w-4 h-4 text-red-600"
        />
        <span className="text-red-700 font-medium">Нет</span>
      </label>
    </div>
  );

  switch (question.type) {
    case 'single_choice':
      return renderSingleChoice();
    case 'multiple_choice':
      return renderMultipleChoice();
    case 'text':
      return renderTextInput();
    case 'rating':
      return renderRatingScale();
    case 'boolean':
      return renderBooleanChoice();
    default:
      return <div>Неподдерживаемый тип вопроса</div>;
  }
};

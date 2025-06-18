import React from 'react';
import { Progress } from '@/components/ui/progress';

interface StatsChartProps {
  data: { [key: string]: number };
  type: string;
  totalResponses: number;
}

export const StatsChart: React.FC<StatsChartProps> = ({
  data,
  type,
  totalResponses,
}) => {
  const renderBarChart = () => {
    const maxValue = Math.max(...Object.values(data));

    return (
      <div className="space-y-3">
        {Object.entries(data).map(([option, count]) => {
          const percentage = totalResponses > 0 ? (count / totalResponses) * 100 : 0;
          const barWidth = maxValue > 0 ? (count / maxValue) * 100 : 0;

          return (
            <div key={option} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="font-medium">{option}</span>
                <span className="text-muted-foreground">
                  {count} ({Math.round(percentage)}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${barWidth}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderRatingChart = () => {
    const ratings = Object.keys(data)
      .map(Number)
      .filter(n => !isNaN(n))
      .sort((a, b) => a - b);

    const maxRating = Math.max(...ratings);
    const avgRating = ratings.length > 0 ? 
      Object.entries(data).reduce((sum, [rating, count]) => {
        return sum + (Number(rating) * count);
      }, 0) / totalResponses : 0;

    return (
      <div className="space-y-4">
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">
            {avgRating.toFixed(1)}
          </div>
          <div className="text-sm text-blue-800">
            Средняя оценка из {maxRating}
          </div>
        </div>

        <div className="space-y-2">
          {ratings.map((rating) => {
            const count = data[rating] || 0;
            const percentage = totalResponses > 0 ? (count / totalResponses) * 100 : 0;

            return (
              <div key={rating} className="flex items-center space-x-3">
                <span className="w-8 text-sm font-medium">{rating}★</span>
                <div className="flex-1">
                  <Progress value={percentage} className="h-2" />
                </div>
                <span className="w-16 text-sm text-muted-foreground text-right">
                  {count} ({Math.round(percentage)}%)
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderTextStats = () => {
    const responses = Object.keys(data).length;

    return (
      <div className="text-center p-4 bg-gray-50 rounded-lg">
        <div className="text-xl font-semibold text-gray-700">
          {responses}
        </div>
        <div className="text-sm text-gray-600">
          Текстовых ответов получено
        </div>
        {responses > 0 && (
          <div className="mt-2 text-xs text-gray-500">
            Показать все ответы можно в панели администратора
          </div>
        )}
      </div>
    );
  };

  switch (type) {
    case 'rating':
      return renderRatingChart();
    case 'text':
      return renderTextStats();
    default:
      return renderBarChart();
  }
};

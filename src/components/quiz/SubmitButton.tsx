import React from 'react';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

interface SubmitButtonProps {
  onSubmit: () => void;
  disabled?: boolean;
  loading?: boolean;
  text?: string;
}

export const SubmitButton: React.FC<SubmitButtonProps> = ({
  onSubmit,
  disabled = false,
  loading = false,
  text = 'Отправить ответы',
}) => {
  return (
    <Button
      onClick={onSubmit}
      disabled={disabled || loading}
      className="px-8 py-2 bg-green-600 hover:bg-green-700 text-white font-medium"
      size="lg"
    >
      {loading ? (
        <div className="flex items-center space-x-2">
          <LoadingSpinner size="sm" />
          <span>Отправка...</span>
        </div>
      ) : (
        text
      )}
    </Button>
  );
};

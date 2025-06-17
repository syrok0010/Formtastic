import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ShareButtonProps {
  quizId: string;
  className?: string;
}

export const ShareButton: React.FC<ShareButtonProps> = ({
  quizId,
  className = '',
}) => {
  const [copied, setCopied] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  const shareUrl = `${window.location.origin}/quiz/${quizId}`;

  const handleShare = async () => {
    try {
      if (navigator.share) {
        // Используем native share API если доступен
        await navigator.share({
          title: 'Пройти опрос',
          text: 'Примите участие в этом опросе',
          url: shareUrl,
        });
      } else {
        // Копируем ссылку в буфер обмена
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setShowAlert(true);

        setTimeout(() => {
          setCopied(false);
          setShowAlert(false);
        }, 3000);
      }
    } catch (error) {
      console.error('Ошибка при попытке поделиться:', error);

      // Fallback: пытаемся скопировать в буфер обмена
      try {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setShowAlert(true);

        setTimeout(() => {
          setCopied(false);
          setShowAlert(false);
        }, 3000);
      } catch (clipboardError) {
        console.error('Ошибка копирования в буфер обмена:', clipboardError);
      }
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setShowAlert(true);

      setTimeout(() => {
        setCopied(false);
        setShowAlert(false);
      }, 3000);
    } catch (error) {
      console.error('Ошибка копирования:', error);
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex space-x-2">
        <Button
          onClick={handleShare}
          variant="outline"
          size="sm"
          className="flex items-center space-x-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
          </svg>
          <span>Поделиться</span>
        </Button>

        <Button
          onClick={handleCopyLink}
          variant="outline"
          size="sm"
          className="flex items-center space-x-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <span>{copied ? 'Скопировано!' : 'Копировать ссылку'}</span>
        </Button>
      </div>

      {showAlert && (
        <Alert variant="success">
          <AlertDescription>
            Ссылка скопирована в буфер обмена!
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

'use client';

import { useQuestionLimit } from '@/hooks/use-subscription-status';
import { useLanguage } from '@/contexts/LanguageContext';

export function QuestionLimitDisplay() {
  const { t } = useLanguage();
  const { remaining, percentage, isPremium } = useQuestionLimit();

  if (isPremium) {
    return null;
  }

  const isLow = remaining <= 3;
  const isZero = remaining <= 0;

  return (
    <div className="mt-2">
      <div className="flex justify-between text-xs text-muted-foreground mb-1">
        <span>{t('questionsRemaining')}</span>
        <span className={isLow ? 'text-orange-500 font-semibold' : ''}>
          {remaining} / 10
        </span>
      </div>
      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-300 ${
            isZero ? 'bg-red-500' : isLow ? 'bg-orange-500' : 'bg-primary'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {isZero && (
        <p className="text-xs text-red-500 mt-1">
          {t('limitReachedUpgrade')}
        </p>
      )}
    </div>
  );
}
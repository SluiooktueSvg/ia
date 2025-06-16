import React from 'react';
import { Smile, Frown, Meh, Loader2 } from 'lucide-react';
import type { ChatMessage } from '@/types/chat';
import { cn } from '@/lib/utils';

interface SentimentIndicatorProps {
  sentiment?: string;
  isLoading?: boolean;
  className?: string;
}

const SentimentIndicator: React.FC<SentimentIndicatorProps> = ({ sentiment, isLoading, className }) => {
  if (isLoading) {
    return (
      <div className={cn("flex items-center text-xs text-muted-foreground animate-pulse", className)}>
        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
        <span>Analyzing...</span>
      </div>
    );
  }

  if (!sentiment) {
    return null;
  }

  let IconComponent;
  let colorClass = 'text-muted-foreground';
  let sentimentLabel = 'Neutral';

  if (sentiment.toLowerCase().includes('positive')) {
    IconComponent = Smile;
    colorClass = 'text-green-500';
    sentimentLabel = 'Positive';
  } else if (sentiment.toLowerCase().includes('negative')) {
    IconComponent = Frown;
    colorClass = 'text-red-500';
    sentimentLabel = 'Negative';
  } else {
    IconComponent = Meh;
    sentimentLabel = 'Neutral';
  }
  
  const briefSentiment = sentiment.split(',')[0]; // Show only "Positive", "Negative", or "Neutral" from "Neutral, with explanation..."

  return (
    <div className={cn("flex items-center text-xs", colorClass, className)} title={sentiment}>
      <IconComponent className="h-3 w-3 mr-1" />
      <span>{briefSentiment || sentimentLabel}</span>
    </div>
  );
};

export default SentimentIndicator;

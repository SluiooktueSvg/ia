import React from 'react';
import { format } from 'date-fns';
import type { ChatMessage } from '@/types/chat';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import SentimentIndicator from './SentimentIndicator';
import { AlertTriangle } from 'lucide-react';

interface MessageBubbleProps {
  message: ChatMessage;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.sender === 'user';
  const avatarLabel = isUser ? 'U' : 'AI';
  const avatarColor = isUser ? 'bg-primary text-primary-foreground' : 'bg-accent text-accent-foreground';
  
  return (
    <div
      className={cn(
        'flex w-full animate-message-in items-start gap-3 py-3',
        isUser ? 'justify-end' : 'justify-start'
      )}
      role="listitem"
      aria-labelledby={`message-text-${message.id}`}
      aria-describedby={`message-meta-${message.id}`}
    >
      {!isUser && (
        <Avatar className="h-8 w-8">
          <AvatarImage src={`https://placehold.co/40x40/87CEEB/2101320?text=AI`} alt="AI Avatar" data-ai-hint="robot face" />
          <AvatarFallback className={cn("text-sm", avatarColor)}>{avatarLabel}</AvatarFallback>
        </Avatar>
      )}
      <div
        className={cn(
          'max-w-[70%] rounded-lg p-3 shadow-md',
          isUser ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-card text-card-foreground rounded-bl-none'
        )}
      >
        <p id={`message-text-${message.id}`} className="text-sm whitespace-pre-wrap break-words">{message.text}</p>
        <div id={`message-meta-${message.id}`} className={cn("mt-1.5 flex items-center gap-2 text-xs", isUser ? "text-primary-foreground/70" : "text-muted-foreground")}>
          <span>{format(new Date(message.timestamp), 'p')}</span>
          {!isUser && <SentimentIndicator sentiment={message.sentiment} isLoading={message.sentimentLoading} />}
        </div>
        {message.error && (
          <div className="mt-1 flex items-center text-xs text-destructive">
            <AlertTriangle className="h-3 w-3 mr-1" />
            <span>{message.error}</span>
          </div>
        )}
      </div>
      {isUser && (
        <Avatar className="h-8 w-8">
           <AvatarImage src={`https://placehold.co/40x40/708090/FFFFFF?text=U`} alt="User Avatar" data-ai-hint="person silhouette" />
          <AvatarFallback className={cn("text-sm", avatarColor)}>{avatarLabel}</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};

export default MessageBubble;

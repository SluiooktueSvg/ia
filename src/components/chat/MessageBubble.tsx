
import React, { useRef, useState, useEffect } from 'react';
import { format } from 'date-fns';
import type { ChatMessage } from '@/types/chat';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import SentimentIndicator from './SentimentIndicator';
import { AlertTriangle, Play, Pause, Loader2, Volume2, User } from 'lucide-react';
import { Button } from '../ui/button';

interface MessageBubbleProps {
  message: ChatMessage;
}

const formatMarkdownToHtml = (text: string): string => {
  let html = text;
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__(.*?)__/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  html = html.replace(/_(.*?)_/g, '<em>$1</em>');
  html = html.replace(/\n/g, '<br />');
  return html;
};

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.sender === 'user';
  const avatarLabel = isUser ? 'U' : 'AI';
  const avatarColor = isUser ? 'bg-primary text-primary-foreground' : 'bg-accent text-accent-foreground';
  
  const formattedText = message.sender === 'ai' ? formatMarkdownToHtml(message.text) : message.text;

  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Auto-play audio when the URL is available and it hasn't been played before.
  useEffect(() => {
    if (message.audioUrl && !message.hasPlayedAudio && audioRef.current) {
        audioRef.current.play().catch(e => console.error("Audio autoplay failed:", e));
        // We need a way to mark that it has been played to avoid re-playing on re-renders.
        // This requires a change in the state management (e.g., in useChatController).
        // For now, this will attempt to play every time the component renders with a new URL.
    }
  }, [message.audioUrl, message.hasPlayedAudio]);

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
    }
  };
  
  const handleAudioEnd = () => {
    setIsPlaying(false);
  };

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
          'max-w-[85%] md:max-w-[70%] rounded-lg p-3 shadow-md',
          isUser ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-card text-card-foreground rounded-bl-none'
        )}
      >
        {message.sender === 'ai' ? (
          <p 
            id={`message-text-${message.id}`} 
            className="text-sm break-words"
            dangerouslySetInnerHTML={{ __html: formattedText }}
          />
        ) : (
          <p id={`message-text-${message.id}`} className="text-sm whitespace-pre-wrap break-words">{message.text}</p>
        )}
        <div id={`message-meta-${message.id}`} className={cn("mt-1.5 flex items-center gap-2 text-xs", isUser ? "text-primary-foreground/70" : "text-muted-foreground")}>
          <span>{format(new Date(message.timestamp), 'p')}</span>
          {!isUser && <SentimentIndicator sentiment={message.sentiment} isLoading={message.sentimentLoading} />}
          {!isUser && message.audioUrl && (
            <>
              <audio 
                ref={audioRef} 
                src={message.audioUrl} 
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={handleAudioEnd}
                preload="auto"
                autoPlay={!message.hasPlayedAudio} // Attempt to autoplay if not played
              />
              <Button variant="ghost" size="icon" className="h-5 w-5" onClick={handlePlayPause}>
                {isPlaying ? <Pause className="h-3 w-3"/> : <Volume2 className="h-3 w-3"/>}
              </Button>
            </>
          )}
          {!isUser && message.audioLoading && (
              <div className="flex items-center text-xs text-muted-foreground">
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                <span>Audio...</span>
              </div>
          )}
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
           <AvatarImage src={message.avatarUrl} alt="User Avatar" />
           <AvatarFallback className={cn("text-sm", avatarColor)}>
             <User className="h-4 w-4" />
           </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};

export default MessageBubble;

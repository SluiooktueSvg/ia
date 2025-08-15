
import React, { useRef, useState, useEffect } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { ChatMessage } from '@/types/chat';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import SentimentIndicator from './SentimentIndicator';
import { AlertTriangle, Pause, Loader2, Volume2, MicOff } from 'lucide-react';
import { Button } from '../ui/button';
import { textToSpeech } from '@/ai/flows/text-to-speech';
import { useToast } from '@/hooks/use-toast';

interface MessageBubbleProps {
  message: ChatMessage;
  onAudioGenerated: (messageId: string, audioUrl: string) => void;
  onAudioError: (messageId: string, error: string) => void;
  isTtsQuotaExceeded: boolean;
  setIsTtsQuotaExceeded: (value: boolean) => void;
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

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, onAudioGenerated, onAudioError, isTtsQuotaExceeded, setIsTtsQuotaExceeded }) => {
  const isUser = message.sender === 'user';
  const avatarLabel = isUser ? message.avatarUrl?.charAt(0).toUpperCase() || 'U' : 'AI';
  const avatarColor = isUser ? 'bg-primary text-primary-foreground' : 'bg-accent text-accent-foreground';
  
  const formattedText = message.sender === 'ai' ? formatMarkdownToHtml(message.text) : message.text;

  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const { toast } = useToast();
  
  const handleAudioEnd = () => {
    setIsPlaying(false);
  };

  const handlePlayPause = async () => {
    if (audioRef.current && message.audioUrl) {
        if (isPlaying) {
          audioRef.current.pause();
        } else {
          audioRef.current.play().catch(e => console.error("Audio playback failed", e));
        }
        return;
    }

    // From here, we handle generating audio if it doesn't exist
    if (message.audioLoading) {
      return; // Do nothing if audio is already being loaded
    }
    
    // Proactive check: if quota is already known to be exceeded, don't even try.
    if (isTtsQuotaExceeded) {
      toast({
        variant: "success",
        title: "Límite de Audio Alcanzado",
        description: "¡Has alcanzado el límite de hoy! Inténtalo de nuevo mañana.",
      });
      return;
    }

    try {
      // Set loading state in parent
      onAudioGenerated(message.id, ''); // Clearing any previous URL and indicating loading start
      const { audioUrl } = await textToSpeech(message.text);
      onAudioGenerated(message.id, audioUrl); // Update with the new URL
    } catch (error: any) {
      console.error("On-demand audio generation failed:", error);
      // Pass the error message to the controller to handle quota exceeded state
      onAudioError(message.id, error.message || "Failed to generate audio.");
    }
  };

  // Effect to play audio automatically once the URL is available and it hasn't been played before
  useEffect(() => {
    if (message.audioUrl && audioRef.current && !message.hasPlayedAudio) {
      // Set hasPlayedAudio to true immediately to prevent re-playing
      onAudioGenerated(message.id, message.audioUrl);
      
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(e => console.error("Audio autoplay failed. User interaction may be required.", e));
      }
    }
  }, [message.audioUrl, message.hasPlayedAudio, message.id, onAudioGenerated]);

  const isButtonDisabled = message.audioLoading || (isTtsQuotaExceeded && !message.audioUrl);

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
          <AvatarFallback className={cn("text-sm", avatarColor)}>AI</AvatarFallback>
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
          <span>{format(new Date(message.timestamp), 'p', { locale: es })}</span>
          {!isUser && <SentimentIndicator sentiment={message.sentiment} isLoading={message.sentimentLoading} />}
          {!isUser && (
            <>
              {message.audioUrl && <audio 
                ref={audioRef} 
                src={message.audioUrl} 
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={handleAudioEnd}
                preload="auto"
              />}
              <Button variant="ghost" size="icon" className="h-5 w-5" onClick={handlePlayPause} disabled={isButtonDisabled}>
                {message.audioLoading ? (
                  <Loader2 className="h-3 w-3 animate-spin"/>
                ) : isPlaying ? (
                  <Pause className="h-3 w-3"/>
                ) : (isButtonDisabled && !message.audioUrl) ? (
                  <MicOff className="h-3 w-3 text-destructive" />
                ) : (
                  <Volume2 className="h-3 w-3"/>
                )}
              </Button>
            </>
          )}
        </div>
      </div>
      {isUser && (
         <Avatar className="h-8 w-8">
           <AvatarImage src={message.avatarUrl ?? undefined} alt="User Avatar" />
           <AvatarFallback className={cn("text-sm", avatarColor)}>
             {message.avatarUrl?.charAt(0).toUpperCase() || 'U'}
           </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};

export default MessageBubble;

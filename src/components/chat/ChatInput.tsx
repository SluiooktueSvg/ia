
'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { SendHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  currentMessage: string;
  setCurrentMessage: (message: string) => void;
  isCentered?: boolean;
}

const placeholderPhrases = [
  "Escribe tu mensaje...",
  "¿En qué puedo ayudarte hoy?",
  "Pregúntame lo que quieras...",
  "¿Tienes alguna duda?",
  "Cuéntame una idea...",
  "Exploremos juntos...",
];
const TYPING_SPEED = 100;
const DELETING_SPEED = 50;
const PAUSE_DURATION = 2000;

const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  currentMessage,
  setCurrentMessage,
  isCentered = false,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [animatedPlaceholder, setAnimatedPlaceholder] = useState('');
  const [showCursor, setShowCursor] = useState(true);

  // --- Cursor Blinking Effect ---
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);
    return () => clearInterval(cursorInterval);
  }, []);

  // --- Placeholder Animation Effect ---
  useEffect(() => {
    if (currentMessage) {
        // If user is typing, clear animated placeholder and stop
        setAnimatedPlaceholder('');
        return;
    }
    
    let phraseIndex = 0;
    let charIndex = 0;
    let isTyping = true;
    let lastUpdateTime = 0;
    let pauseUntil = 0;
    let animationFrameId: number;

    const animate = (timestamp: number) => {
        if (pauseUntil > timestamp) {
            animationFrameId = requestAnimationFrame(animate);
            return;
        }

        const elapsed = timestamp - lastUpdateTime;
        const speed = isTyping ? TYPING_SPEED : DELETING_SPEED;

        if (elapsed > speed) {
            lastUpdateTime = timestamp;

            const currentPhrase = placeholderPhrases[phraseIndex];
            
            if (isTyping) {
                if (charIndex < currentPhrase.length) {
                    charIndex++;
                    setAnimatedPlaceholder(currentPhrase.substring(0, charIndex));
                } else {
                    // Finished typing, pause
                    isTyping = false;
                    pauseUntil = timestamp + PAUSE_DURATION;
                }
            } else { // Deleting
                if (charIndex > 0) {
                    charIndex--;
                    setAnimatedPlaceholder(currentPhrase.substring(0, charIndex));
                } else {
                    // Finished deleting, switch to next phrase and pause
                    isTyping = true;
                    phraseIndex = (phraseIndex + 1) % placeholderPhrases.length;
                    pauseUntil = timestamp + PAUSE_DURATION / 2;
                }
            }
        }
        animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
        cancelAnimationFrame(animationFrameId);
    };
  }, [currentMessage]); // Re-start animation if user clears the input

  // --- Autoresize Textarea ---
  useEffect(() => {
    if (textareaRef.current) {
      // Reset height to recalculate based on content
      textareaRef.current.style.height = 'auto';
      // Set the height to the scroll height to fit the content
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [currentMessage]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCurrentMessage(e.target.value);
  };

  const handleSubmit = (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    if (currentMessage.trim()) {
      onSendMessage(currentMessage.trim());
      setCurrentMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };
  
  const placeholderTextToShow = currentMessage ? "" : animatedPlaceholder;
  const displayBlinkingCursor = !currentMessage && showCursor;

  return (
    <form
      id="chat-input-form"
      onSubmit={handleSubmit}
      className={cn(
        "relative bg-background p-2 md:p-3",
        !isCentered && "border-t border-border"
      )}
    >
      <div className={cn(
        "relative flex w-full items-center bg-card rounded-full transition-shadow duration-200",
        "focus-within:ring-2 focus-within:ring-green-400"
      )}>
        <Textarea
          ref={textareaRef}
          value={currentMessage}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholderTextToShow + (displayBlinkingCursor ? '▋' : '')}
          className={cn(
            "flex-grow resize-none overflow-y-hidden bg-transparent py-3 pl-5 pr-14 text-base min-h-[48px] max-h-32 shadow-none border-none focus-visible:ring-0",
            !currentMessage && "placeholder-muted-foreground/70" 
          )}
          rows={1}
          aria-label="Chat message input"
        />
        <Button
          type="submit"
          size="icon"
          className="absolute right-2 flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-accent"
          aria-label="Send message"
          disabled={!currentMessage.trim()}
        >
          <SendHorizontal className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
};

export default ChatInput;

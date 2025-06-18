
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
const PAUSE_DURATION = 1500;

const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  currentMessage,
  setCurrentMessage,
  isCentered = false,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [animatedPlaceholder, setAnimatedPlaceholder] = useState('');
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'; // Reset height
      if (currentMessage) {
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      } else {
        textareaRef.current.style.height = 'auto';
      }
    }
  }, [currentMessage]);

  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);
    return () => clearInterval(cursorInterval);
  }, []);

  useEffect(() => {
    if (currentMessage) {
      setAnimatedPlaceholder(''); // Clear animated placeholder if user is typing
      // No need to run animation logic if user is typing
      return;
    }

    if (isPaused) return;

    let timeoutId: NodeJS.Timeout;

    if (isTyping) { // Writing mode
      if (charIndex < placeholderPhrases[phraseIndex].length) {
        timeoutId = setTimeout(() => {
          setAnimatedPlaceholder(prev => prev + placeholderPhrases[phraseIndex][charIndex]);
          setCharIndex(prev => prev + 1);
        }, TYPING_SPEED);
      } else { // Finished writing current phrase
        setIsPaused(true);
        timeoutId = setTimeout(() => {
          setIsPaused(false);
          setIsTyping(false); // Switch to deleting mode
        }, PAUSE_DURATION);
      }
    } else { // Deleting mode
      if (charIndex > 0) {
        timeoutId = setTimeout(() => {
          setAnimatedPlaceholder(prev => prev.substring(0, prev.length - 1));
          setCharIndex(prev => prev - 1);
        }, DELETING_SPEED);
      } else { // Finished deleting current phrase (animatedPlaceholder is now empty)
        setIsPaused(true);
        timeoutId = setTimeout(() => {
          setIsPaused(false);
          setIsTyping(true); // Switch to typing mode for the new phrase
          setPhraseIndex(prev => (prev + 1) % placeholderPhrases.length); // Move to next phrase
          setCharIndex(0); // Reset charIndex for the new phrase
          // animatedPlaceholder is already empty here because it was fully deleted.
          // No need to setAnimatedPlaceholder('') explicitly if logic is correct.
        }, PAUSE_DURATION / 2);
      }
    }

    return () => clearTimeout(timeoutId);
  }, [charIndex, isTyping, phraseIndex, isPaused, currentMessage]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCurrentMessage(e.target.value);
  };

  const handleSubmit = (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    if (currentMessage.trim()) {
      onSendMessage(currentMessage.trim());
      setCurrentMessage('');
      // Reset animation to start typing the current (or next) phrase cleanly
      setAnimatedPlaceholder('');
      setCharIndex(0);
      setIsTyping(true);
      setIsPaused(false);
      // Optional: uncomment to always restart from the very first phrase
      // setPhraseIndex(0);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };
  
  const displayActualCursor = showCursor && !isPaused && !currentMessage;
  const placeholderTextToShow = currentMessage ? "" : animatedPlaceholder;

  return (
    <form
      id="chat-input-form"
      onSubmit={handleSubmit}
      className={cn(
        "relative bg-background p-3 md:p-4",
        !isCentered && "border-t border-border"
      )}
    >
      <div className="relative flex items-end gap-2">
        <Textarea
          ref={textareaRef}
          value={currentMessage}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholderTextToShow + (displayActualCursor ? '|' : '')}
          className={cn(
            "flex-grow resize-none overflow-y-auto rounded-3xl bg-card p-4 pr-16 shadow-sm max-h-60 text-base",
            !currentMessage && "placeholder-muted-foreground/70" 
          )}
          rows={1}
          aria-label="Chat message input"
        />
        <Button
          type="submit"
          size="icon"
          className="absolute bottom-3 right-3 h-10 w-10 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-accent"
          aria-label="Send message"
          disabled={!currentMessage.trim()}
        >
          <SendHorizontal className="h-5 w-5" />
        </Button>
      </div>
    </form>
  );
};

export default ChatInput;

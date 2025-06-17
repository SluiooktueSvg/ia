
'use client';

import React, { useRef, useEffect, useState } from 'react';
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

const placeholderTexts = [
  "Escribe tu mensaje...",
  "Dame una receta de pastel de chocolate",
  "¿Cuáles son los 5 mejores tips para viajar barato?",
  "¿Qué hora es en Nueva Delhi, India?",
  "Escríbeme un poema sobre la luna",
  "Cuéntame un chiste corto",
  "Explica cómo funciona un motor de combustión",
];

const TYPING_SPEED = 100; // milliseconds
const DELETING_SPEED = 50; // milliseconds
const PAUSE_DURATION = 1500; // milliseconds
const CURSOR_BLINK_RATE = 530; // milliseconds

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
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [placeholderCursor, setPlaceholderCursor] = useState('▋');

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      if (currentMessage) {
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      } else {
        textareaRef.current.style.height = 'auto'; // Reset to single line if currentMessage is cleared
      }
    }
  }, [currentMessage]);

  useEffect(() => {
    // Blinking cursor effect for the placeholder
    if (!currentMessage) { // Only blink if user hasn't typed
      const cursorInterval = setInterval(() => {
        setPlaceholderCursor(prev => (prev === '▋' ? '\u00A0' : '▋')); // Use non-breaking space to prevent collapse
      }, CURSOR_BLINK_RATE);
      return () => clearInterval(cursorInterval);
    } else {
      setPlaceholderCursor(''); // No cursor if user is typing
    }
  }, [currentMessage]);


  useEffect(() => {
    if (currentMessage) {
      setAnimatedPlaceholder(''); 
      return;
    }

    if (isPaused) return;

    const currentPhrase = placeholderTexts[phraseIndex];
    let timeoutId: NodeJS.Timeout;

    if (!isDeleting) { // Typing
      if (charIndex < currentPhrase.length) {
        timeoutId = setTimeout(() => {
          setAnimatedPlaceholder((prev) => currentPhrase.substring(0, charIndex + 1));
          setCharIndex((prev) => prev + 1);
        }, TYPING_SPEED);
      } else { // Finished typing
        setIsPaused(true);
        timeoutId = setTimeout(() => {
          setIsDeleting(true);
          setIsPaused(false);
        }, PAUSE_DURATION);
      }
    } else { // Deleting
      if (charIndex > 0) {
        timeoutId = setTimeout(() => {
          setAnimatedPlaceholder((prev) => currentPhrase.substring(0, charIndex -1));
          setCharIndex((prev) => prev - 1);
        }, DELETING_SPEED);
      } else { // Finished deleting
        setIsPaused(true);
        timeoutId = setTimeout(() => {
          setIsDeleting(false);
          setPhraseIndex((prev) => (prev + 1) % placeholderTexts.length);
          setIsPaused(false);
        }, PAUSE_DURATION / 2);
      }
    }

    return () => clearTimeout(timeoutId);
  }, [charIndex, isDeleting, phraseIndex, isPaused, currentMessage]);

  useEffect(() => {
    if (!currentMessage) {
      setAnimatedPlaceholder('');
      setCharIndex(0);
      setIsDeleting(false);
      setIsPaused(false); 
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
  
  const displayPlaceholder = currentMessage 
    ? "" 
    : `${animatedPlaceholder}${placeholderCursor}`;

  return (
    <form
      id="chat-input-form" // Added ID here
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
          placeholder={displayPlaceholder}
          className={cn(
            "flex-grow resize-none overflow-y-auto rounded-3xl bg-card p-4 pr-16 shadow-sm max-h-60 text-base"
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

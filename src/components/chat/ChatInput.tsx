
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

const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  currentMessage,
  setCurrentMessage,
  isCentered = false,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [currentPlaceholder, setCurrentPlaceholder] = useState('');
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      if (currentMessage) {
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      } else {
        textareaRef.current.style.height = 'auto';
      }
    }
  }, [currentMessage]);

  useEffect(() => {
    if (currentMessage) {
      setCurrentPlaceholder(''); // Stop animation if user is typing
      return;
    }

    if (isPaused) return;

    const currentPhrase = placeholderTexts[phraseIndex];
    let timeoutId: NodeJS.Timeout;

    if (!isDeleting) { // Typing
      if (charIndex < currentPhrase.length) {
        timeoutId = setTimeout(() => {
          setCurrentPlaceholder((prev) => prev + currentPhrase[charIndex]);
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
          setCurrentPlaceholder((prev) => prev.substring(0, prev.length - 1));
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
    // Reset animation if currentMessage becomes empty after being non-empty
    // to ensure it starts fresh from the beginning of a phrase.
    if (!currentMessage) {
      setCurrentPlaceholder('');
      setCharIndex(0);
      setIsDeleting(false);
      // setPhraseIndex(0); // Optionally reset to the first phrase always
      setIsPaused(false); // Ensure animation can restart
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

  return (
    <form
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
          placeholder={currentMessage ? "" : currentPlaceholder}
          className={cn(
            "flex-grow resize-none overflow-y-auto rounded-3xl bg-card p-4 pr-16 shadow-sm max-h-60 text-base",
            "input-animated-focus"
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


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

const ANIMATION_DURATION_MS = 3000; // Must match animation duration in tailwind.config.ts

const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  currentMessage,
  setCurrentMessage,
  isCentered = false,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [currentPlaceholderIndex, setCurrentPlaceholderIndex] = useState(0);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      if (currentMessage) {
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      } else {
        textareaRef.current.style.height = 'auto'; // Default height for one row
      }
    }
  }, [currentMessage]);

  useEffect(() => {
    // Only run animation if the input is empty
    if (!currentMessage) {
      const intervalId = setInterval(() => {
        setCurrentPlaceholderIndex(prevIndex => (prevIndex + 1) % placeholderTexts.length);
      }, ANIMATION_DURATION_MS);

      return () => clearInterval(intervalId);
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
      // Reset placeholder to the first one after sending a message for a fresh start
      setCurrentPlaceholderIndex(0);
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
          placeholder={currentMessage ? "" : " "} // Use a space to ensure ::placeholder pseudo-element exists for styling if needed, but hide native one when animated placeholder is active
          className={cn(
            "flex-grow resize-none overflow-y-auto rounded-3xl bg-card p-5 pr-20 shadow-sm max-h-60 text-base", // Increased padding and rounded corners
            "input-animated-focus"
          )}
          rows={1}
          aria-label="Chat message input"
        />
        {!currentMessage && (
          <div
            className="absolute top-0 left-0 flex items-center h-full pl-5 pr-20 pointer-events-none" // Adjusted padding to match Textarea's p-5
            aria-hidden="true"
          >
            <div className="relative h-6 overflow-hidden w-full"> {/* Adjust height (h-6) to match line height of textarea */}
              <span
                key={currentPlaceholderIndex}
                className="absolute w-full text-muted-foreground animate-placeholder-scroll-item"
              >
                {placeholderTexts[currentPlaceholderIndex]}
              </span>
            </div>
          </div>
        )}
        <Button
          type="submit"
          size="icon"
          className="absolute bottom-[18px] right-[18px] h-14 w-14 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-accent" // Adjusted size and position
          aria-label="Send message"
          disabled={!currentMessage.trim()}
        >
          <SendHorizontal className="h-6 w-6" /> {/* Slightly larger icon */}
        </Button>
      </div>
    </form>
  );
};

export default ChatInput;

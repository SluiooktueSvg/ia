
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

const staticPlaceholderPhrase = "Escribe tu mensaje...";
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
  const [isTyping, setIsTyping] = useState(true);
  const [charIndex, setCharIndex] = useState(0);
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'; // Reset height
      if (currentMessage) {
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      }
    }
  }, [currentMessage]);

  useEffect(() => {
    // Blinking cursor effect
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);
    return () => clearInterval(cursorInterval);
  }, []);

  useEffect(() => {
    if (currentMessage) {
      // If user is typing, hide animated placeholder
      setAnimatedPlaceholder('');
      return;
    }

    let timeoutId: NodeJS.Timeout;

    if (isTyping) {
      if (charIndex < staticPlaceholderPhrase.length) {
        timeoutId = setTimeout(() => {
          setAnimatedPlaceholder(prev => prev + staticPlaceholderPhrase[charIndex]);
          setCharIndex(prev => prev + 1);
        }, TYPING_SPEED);
      } else {
        timeoutId = setTimeout(() => setIsTyping(false), PAUSE_DURATION);
      }
    } else { // Deleting
      if (charIndex > 0) {
        timeoutId = setTimeout(() => {
          setAnimatedPlaceholder(prev => prev.substring(0, prev.length - 1));
          setCharIndex(prev => prev - 1);
        }, DELETING_SPEED);
      } else {
        timeoutId = setTimeout(() => {
          setIsTyping(true);
        }, PAUSE_DURATION / 2);
      }
    }

    return () => clearTimeout(timeoutId);
  }, [charIndex, isTyping, currentMessage]);


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
  
  const displayPlaceholder = currentMessage ? "" : (animatedPlaceholder + (showCursor ? '|' : ''));

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
          placeholder={displayPlaceholder}
          className={cn(
            "flex-grow resize-none overflow-y-auto rounded-3xl bg-card p-4 pr-16 shadow-sm max-h-60 text-base",
            !currentMessage && "placeholder-muted-foreground/70" // Style for animated placeholder
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

'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { SendHorizontal, CornerDownLeft, Sparkles, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onInputChange?: (currentText: string) => void;
  isLoadingCompletion: boolean;
  completionSuggestion: string | null;
  currentMessage: string;
  setCurrentMessage: (message: string) => void;
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  onInputChange,
  isLoadingCompletion,
  completionSuggestion,
  currentMessage,
  setCurrentMessage,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showSuggestion, setShowSuggestion] = useState(false);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [currentMessage]);

  useEffect(() => {
    if (completionSuggestion && completionSuggestion.trim() !== '' && completionSuggestion !== currentMessage) {
        setShowSuggestion(true);
    } else {
        setShowSuggestion(false);
    }
  }, [completionSuggestion, currentMessage]);


  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCurrentMessage(e.target.value);
    if (onInputChange) {
      onInputChange(e.target.value);
    }
  };

  const handleSubmit = (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    if (currentMessage.trim()) {
      onSendMessage(currentMessage.trim());
      setCurrentMessage('');
      setShowSuggestion(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === 'Tab' && showSuggestion && completionSuggestion) {
      e.preventDefault();
      setCurrentMessage(completionSuggestion);
      setShowSuggestion(false);
    }
  };
  
  const acceptSuggestion = () => {
    if (completionSuggestion) {
      setCurrentMessage(completionSuggestion);
      setShowSuggestion(false);
      textareaRef.current?.focus();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative border-t border-border bg-background p-3 md:p-4">
      <div className="relative flex items-end gap-2">
        <Textarea
          ref={textareaRef}
          value={currentMessage}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
          className="flex-grow resize-none overflow-y-auto rounded-lg border-input bg-card p-3 pr-20 shadow-sm focus:ring-accent max-h-40"
          rows={1}
          aria-label="Chat message input"
          aria-autocomplete="list"
          aria-haspopup={showSuggestion && !!completionSuggestion}
        />
        <Button
          type="submit"
          size="icon"
          className="absolute bottom-2 right-2 h-10 w-10 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-accent"
          aria-label="Send message"
          disabled={!currentMessage.trim()}
        >
          <SendHorizontal className="h-5 w-5" />
        </Button>
      </div>
      {showSuggestion && completionSuggestion && (
        <div 
          className="absolute bottom-full left-0 right-0 mb-1 p-2 bg-popover border border-border rounded-md shadow-lg text-sm text-popover-foreground flex justify-between items-center"
          role="tooltip"
          id="autocomplete-suggestion"
        >
          <span className="flex items-center">
            <Sparkles className="h-4 w-4 mr-2 text-accent" /> 
            {completionSuggestion}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={acceptSuggestion}
            className="flex items-center text-accent hover:text-accent-foreground"
            aria-label="Accept suggestion"
          >
            Accept <CornerDownLeft className="h-4 w-4 ml-1" /> (Tab)
          </Button>
        </div>
      )}
       {isLoadingCompletion && (
         <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full px-2 py-1 bg-muted text-muted-foreground text-xs rounded-t-md flex items-center">
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            <span>AI thinking...</span>
         </div>
       )}
    </form>
  );
};

export default ChatInput;

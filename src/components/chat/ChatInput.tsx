
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

  useEffect(() => { // Control del parpadeo del cursor
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);
    return () => clearInterval(cursorInterval);
  }, []);

  useEffect(() => { // Lógica de animación del placeholder
    if (currentMessage) {
      // Si el usuario está escribiendo, limpiar el placeholder animado y detener la animación.
      if (animatedPlaceholder !== '') setAnimatedPlaceholder('');
      return;
    }

    if (isPaused) {
      // Si está en pausa, no hacer nada más en este ciclo del efecto.
      return;
    }

    let timeoutId: NodeJS.Timeout;

    if (isTyping) { // Modo escritura
      if (charIndex < placeholderPhrases[phraseIndex].length) {
        timeoutId = setTimeout(() => {
          setAnimatedPlaceholder(prev => prev + placeholderPhrases[phraseIndex][charIndex]);
          setCharIndex(prev => prev + 1);
        }, TYPING_SPEED);
      } else { // Terminado de escribir la frase actual
        setIsPaused(true);
        timeoutId = setTimeout(() => {
          setIsPaused(false);
          setIsTyping(false); // Cambiar a modo borrado
        }, PAUSE_DURATION);
      }
    } else { // Modo borrado
      if (charIndex > 0) {
        timeoutId = setTimeout(() => {
          setAnimatedPlaceholder(prev => prev.substring(0, prev.length - 1));
          setCharIndex(prev => prev - 1);
        }, DELETING_SPEED);
      } else { // Terminado de borrar la frase actual (animatedPlaceholder está vacío)
        setIsPaused(true);
        timeoutId = setTimeout(() => {
          setAnimatedPlaceholder(''); // Asegurar que está vacío
          setPhraseIndex(prev => (prev + 1) % placeholderPhrases.length); // Mover a la siguiente frase
          setCharIndex(0); // Reiniciar índice de caracteres para la nueva frase
          setIsTyping(true); // Cambiar a modo escritura para la nueva frase
          setIsPaused(false); // Reanudar
        }, PAUSE_DURATION / 2);
      }
    }

    return () => clearTimeout(timeoutId);
  }, [charIndex, isTyping, phraseIndex, isPaused, currentMessage]); // animatedPlaceholder eliminado de las dependencias

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCurrentMessage(e.target.value);
  };

  const handleSubmit = (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    if (currentMessage.trim()) {
      onSendMessage(currentMessage.trim());
      setCurrentMessage('');
      // Reiniciar animación del placeholder desde el principio si el usuario envía un mensaje.
      setAnimatedPlaceholder('');
      // setPhraseIndex(0); // Opcional: para volver siempre a la primera frase.
      setCharIndex(0);
      setIsTyping(true);
      setIsPaused(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };
  
  const placeholderTextToShow = currentMessage ? "" : animatedPlaceholder;
  // El cursor parpadea si el usuario no está escribiendo y showCursor es true
  const displayBlinkingCursor = !currentMessage && showCursor;

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
          placeholder={placeholderTextToShow + (displayBlinkingCursor ? '|' : '')}
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

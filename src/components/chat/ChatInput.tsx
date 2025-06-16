
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

const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  currentMessage,
  setCurrentMessage,
  isCentered = false,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [animatedPlaceholder, setAnimatedPlaceholder] = useState("");
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
    if (currentMessage || isPaused) {
      // Si el usuario está escribiendo o la animación está pausada, no hacer nada.
      return;
    }

    const typeSpeed = 120; // Milisegundos por caracter al escribir
    const deleteSpeed = 70; // Milisegundos por caracter al borrar
    const pauseAfterTyping = 2000; // Pausa después de escribir una frase completa
    const pauseAfterDeleting = 500; // Pausa después de borrar una frase, antes de la siguiente

    let timeoutId: NodeJS.Timeout;

    const handleAnimation = () => {
      const currentFullPhrase = placeholderTexts[phraseIndex];
      if (isDeleting) {
        // Modo Borrado
        if (charIndex > 0) {
          setAnimatedPlaceholder(currentFullPhrase.substring(0, charIndex - 1));
          setCharIndex(prev => prev - 1);
          timeoutId = setTimeout(handleAnimation, deleteSpeed);
        } else {
          // Terminado de borrar
          setIsDeleting(false);
          setPhraseIndex(prev => (prev + 1) % placeholderTexts.length); // Pasar a la siguiente frase
          // charIndex ya es 0
          setIsPaused(true);
          timeoutId = setTimeout(() => setIsPaused(false), pauseAfterDeleting);
        }
      } else {
        // Modo Escritura
        if (charIndex < currentFullPhrase.length) {
          setAnimatedPlaceholder(currentFullPhrase.substring(0, charIndex + 1));
          setCharIndex(prev => prev + 1);
          timeoutId = setTimeout(handleAnimation, typeSpeed);
        } else {
          // Terminado de escribir
          setIsDeleting(true);
          // charIndex está en currentFullPhrase.length
          setIsPaused(true);
          timeoutId = setTimeout(() => setIsPaused(false), pauseAfterTyping);
        }
      }
    };

    // Iniciar la animación
    // Si animatedPlaceholder está vacío (al inicio o después de reset), comenzar inmediatamente.
    // Sino, continuar con la velocidad actual.
    const initialDelay = animatedPlaceholder === "" ? typeSpeed : (isDeleting ? deleteSpeed : typeSpeed);
    timeoutId = setTimeout(handleAnimation, initialDelay);

    return () => clearTimeout(timeoutId);
  }, [animatedPlaceholder, phraseIndex, charIndex, isDeleting, isPaused, currentMessage]);

  useEffect(() => {
    if (currentMessage) {
      // Si el usuario escribe, la animación se detiene por la condición en el useEffect principal.
      // El placeholder del Textarea se ocultará nativamente.
    } else {
      // Si el usuario borra todo el texto, reiniciar la animación.
      setPhraseIndex(0); // Volver a la primera frase
      setCharIndex(0);   // Empezar desde el primer carácter
      setIsDeleting(false); // Asegurarse de que esté en modo escritura
      setIsPaused(false);   // Asegurarse de que no esté pausado
      setAnimatedPlaceholder(""); // Esto provocará que la animación comience a escribir la primera frase
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
          placeholder={animatedPlaceholder || placeholderTexts[0]} // Fallback al primer placeholder
          className={cn(
            "flex-grow resize-none overflow-y-auto rounded-2xl bg-card p-4 pr-20 shadow-sm max-h-52 text-base",
            "input-animated-focus"
          )}
          rows={1}
          aria-label="Chat message input"
        />
        <Button
          type="submit"
          size="icon"
          className="absolute bottom-3.5 right-3.5 h-12 w-12 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-accent"
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

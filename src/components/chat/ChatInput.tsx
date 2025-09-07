
'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { SendHorizontal, Mic, MicOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  currentMessage: string;
  setCurrentMessage: (message: string) => void;
  isCentered?: boolean;
}

const placeholderPhrases = [
  "Escribe tu mensaje o usa el micrófono...",
  "¿En qué puedo ayudarte hoy?",
  "Pregúntame lo que quieras...",
  "Dime tu consulta...",
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
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [animatedPlaceholder, setAnimatedPlaceholder] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [isSpeechRecognitionSupported, setIsSpeechRecognitionSupported] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // This effect runs only on the client, so `window` is available.
    if (typeof window !== 'undefined') {
      if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
        setIsSpeechRecognitionSupported(true);
      }
    }
  }, []);

  const initializeRecognition = useCallback(() => {
    if (!isSpeechRecognitionSupported) return;
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognitionInstance = new SpeechRecognition();
    recognitionInstance.continuous = false;
    recognitionInstance.lang = 'es-ES';
    recognitionInstance.interimResults = false;

    recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        setCurrentMessage(transcript);
        if (transcript.trim()) {
            onSendMessage(transcript.trim());
            setCurrentMessage('');
        }
        setIsListening(false);
    };

    recognitionInstance.onerror = (event: SpeechRecognitionErrorEvent) => {
        let errorMessage = "Ocurrió un error con el reconocimiento de voz.";
        if (event.error === 'no-speech') {
            errorMessage = "No se detectó ninguna voz. Inténtalo de nuevo.";
        } else if (event.error === 'audio-capture') {
            errorMessage = "No se pudo acceder al micrófono. Verifica los permisos.";
        } else if (event.error === 'not-allowed') {
            errorMessage = "Permiso para el micrófono denegado. Habilítalo en la configuración de tu navegador.";
        }
        
        toast({
            variant: "destructive",
            title: "Error de Voz",
            description: errorMessage,
        });
        setIsListening(false);
    };

    recognitionInstance.onend = () => {
        setIsListening(false);
    };

    recognitionRef.current = recognitionInstance;
  }, [isSpeechRecognitionSupported, setCurrentMessage, onSendMessage, toast]);


  const handleMicClick = () => {
    if (!isSpeechRecognitionSupported) {
        toast({
            variant: "destructive",
            title: "Navegador no compatible",
            description: "Tu navegador no soporta el reconocimiento de voz.",
        });
        return;
    }

    if (!recognitionRef.current) {
        initializeRecognition();
    }
    
    // We need to re-check after initialization attempt.
    if (!recognitionRef.current) {
        // This case can happen if initialization fails for some reason.
        return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };


  // --- Cursor Blinking Effect ---
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);
    return () => clearInterval(cursorInterval);
  }, []);

  // --- Placeholder Animation Effect ---
  useEffect(() => {
    if (currentMessage || isListening) {
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
                    isTyping = false;
                    pauseUntil = timestamp + PAUSE_DURATION;
                }
            } else { // Deleting
                if (charIndex > 0) {
                    charIndex--;
                    setAnimatedPlaceholder(currentPhrase.substring(0, charIndex));
                } else {
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
  }, [currentMessage, isListening]);

  // --- Autoresize Textarea ---
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${scrollHeight}px`;
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

  const placeholderTextToShow = currentMessage ? "" : (isListening ? "Escuchando..." : animatedPlaceholder);
  const displayBlinkingCursor = !currentMessage && !isListening && showCursor;

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
        "relative flex w-full items-end gap-2",
        isCentered && "bg-card rounded-3xl border border-border/50 p-1"
      )}>
        <Textarea
          ref={textareaRef}
          value={currentMessage}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholderTextToShow + (displayBlinkingCursor ? '▋' : '')}
          className={cn(
            "flex-grow resize-none overflow-y-hidden rounded-3xl py-3 pl-5 pr-20 text-sm md:text-base min-h-[52px] max-h-32 shadow-none border-0 transition-colors duration-200",
            "focus:ring-0",
            !currentMessage && "placeholder-muted-foreground/70",
            isCentered ? "bg-card" : "bg-card focus:border-green-500 border"
          )}
          rows={1}
          aria-label="Chat message input"
          disabled={isListening}
        />
        <div className="absolute right-3 bottom-2 flex items-center gap-1">
            {isSpeechRecognitionSupported && (
              <Button
                type="button"
                size="icon"
                onClick={handleMicClick}
                className={cn(
                    "h-9 w-9 rounded-full focus:ring-accent",
                    isListening ? "bg-red-500 text-white hover:bg-red-600 animate-pulse" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                )}
                aria-label={isListening ? "Stop listening" : "Start listening"}
              >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
            )}
            <Button
              type="submit"
              size="icon"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-accent"
              aria-label="Send message"
              disabled={!currentMessage.trim() || isListening}
            >
              <SendHorizontal className="h-4 w-4" />
            </Button>
        </div>
      </div>
    </form>
  );
};

export default ChatInput;

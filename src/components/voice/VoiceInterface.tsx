
'use client';

import React from 'react';
import { useVoiceController } from '@/hooks/useVoiceController';
import { Mic, Loader, Bot, Ear, BrainCircuit } from 'lucide-react';
import { cn } from '@/lib/utils';
import LSAIGLogo from '../AuraChatLogo';

const VoiceInterface: React.FC = () => {
  const {
    status,
    transcript,
    aiResponse,
    startListening,
    audioRef,
  } = useVoiceController();

  const getStatusInfo = () => {
    switch (status) {
      case 'listening':
        return {
          icon: <Ear className="h-12 w-12 text-accent" />,
          label: 'Escuchando...',
          color: 'border-accent/80',
          animation: 'animate-pulse-voice',
        };
      case 'processing':
        return {
          icon: <BrainCircuit className="h-12 w-12 text-primary" />,
          label: 'Procesando...',
          color: 'border-primary/80',
          animation: 'animate-spin-slow',
        };
      case 'speaking':
        return {
          icon: <Bot className="h-12 w-12 text-green-500" />,
          label: 'Hablando...',
          color: 'border-green-500/80',
          animation: 'animate-pulse-voice-speaking',
        };
      case 'idle':
      default:
        return {
          icon: <Mic className="h-12 w-12 text-foreground/80" />,
          label: 'Toca para hablar',
          color: 'border-foreground/30',
          animation: 'hover:scale-105',
        };
    }
  };

  const { icon, label, color, animation } = getStatusInfo();

  return (
    <div className="flex h-full flex-col items-center justify-center gap-8 text-center">
      <div className="absolute top-16">
        <LSAIGLogo />
      </div>

      <div className="flex h-64 w-64 items-center justify-center">
        <button
          onClick={startListening}
          disabled={status !== 'idle'}
          className={cn(
            'relative flex h-52 w-52 items-center justify-center rounded-full border-4 bg-card shadow-2xl transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-accent/50 disabled:cursor-not-allowed',
            color,
            animation
          )}
        >
          {icon}
        </button>
      </div>

      <div className="h-24 w-full max-w-md px-4">
        <p className="text-xl font-medium text-muted-foreground">{label}</p>
        <p className="mt-2 min-h-[2.5em] text-lg text-foreground">
          {status === 'listening' ? transcript : status === 'speaking' ? aiResponse : ''}
        </p>
      </div>
      <audio ref={audioRef} className="hidden" />
    </div>
  );
};

export default VoiceInterface;

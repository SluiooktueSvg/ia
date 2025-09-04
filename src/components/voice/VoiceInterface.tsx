
'use client';

import React from 'react';
import { useVoiceController } from '@/hooks/useVoiceController';
import { cn } from '@/lib/utils';
import SeleneLogo from '../SeleneLogo';

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
          label: 'Escuchando...',
          outerWave: 'animate-wave',
          innerWave: 'animate-wave animation-delay-[-2s]',
          centerColor: 'bg-accent/80',
        };
      case 'processing':
        return {
          label: 'Procesando...',
          outerWave: 'animate-pulse-glow border-primary/80',
          innerWave: '',
          centerColor: 'bg-primary/80',
        };
      case 'speaking':
        return {
          label: 'Hablando...',
          outerWave: 'animate-wave animation-delay-[-1s] border-green-500/80',
          innerWave: 'animate-wave animation-delay-[-3s] border-green-500/80',
          centerColor: 'bg-green-500/80',
        };
      case 'idle':
      default:
        return {
          label: 'Toca para hablar',
          outerWave: 'border-foreground/20',
          innerWave: '',
          centerColor: 'bg-foreground/20',
        };
    }
  };

  const { label, outerWave, innerWave, centerColor } = getStatusInfo();

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-8 overflow-hidden bg-background text-center">
      <div className="absolute top-16">
        <SeleneLogo />
      </div>

      {/* Main voice visualizer button */}
      <div className="flex h-64 w-64 items-center justify-center">
        <button
          onClick={startListening}
          disabled={status !== 'idle'}
          className={cn(
            'relative flex h-56 w-56 items-center justify-center rounded-full transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-accent/50 disabled:cursor-not-allowed',
            status === 'idle' && 'hover:scale-105'
          )}
          aria-label={label}
        >
          {/* Animated Waves */}
          <div
            className={cn(
              'absolute h-full w-full rounded-full border-2',
              outerWave
            )}
          />
          <div
            className={cn(
              'absolute h-full w-full rounded-full border-2',
              innerWave
            )}
          />

          {/* Central Circle */}
          <div
            className={cn(
              'h-32 w-32 rounded-full transition-colors duration-300',
              centerColor
            )}
          />
        </button>
      </div>

      {/* Status and Transcript Display */}
      <div className="h-24 w-full max-w-md px-4">
        <p className="text-xl font-medium text-muted-foreground">{label}</p>
        <p className="mt-2 min-h-[2.5em] text-lg text-foreground">
          {status === 'listening'
            ? transcript
            : status === 'speaking'
            ? aiResponse
            : ''}
        </p>
      </div>

      <audio ref={audioRef} className="hidden" />
    </div>
  );
};

export default VoiceInterface;

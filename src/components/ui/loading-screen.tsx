
'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingScreenProps {
  message?: string;
  className?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ message, className }) => {
  return (
    <div className={cn(
      "flex h-screen w-full flex-col items-center justify-center bg-background",
      // Allow parent to pass down fade-out animation
      className
    )}>
      <div className="font-code text-2xl md:text-3xl text-primary flex gap-2">
         <span className="animate-code-load" style={{ animationDelay: '0.1s' }}>[</span>
         <span className="animate-code-load" style={{ animationDelay: '0.2s' }}>=</span>
         <span className="animate-code-load" style={{ animationDelay: '0.3s' }}>=</span>
         <span className="animate-code-load" style={{ animationDelay: '0.4s' }}>=</span>
         <span className="animate-code-load" style={{ animationDelay: '0.5s' }}>=</span>
         <span className="animate-code-load" style={{ animationDelay: '0.6s' }}>]</span>
      </div>
      <p className="mt-6 text-sm text-muted-foreground animate-pulse">
        {message ? message : <>&nbsp;</>}
      </p>
    </div>
  );
};

export default LoadingScreen;

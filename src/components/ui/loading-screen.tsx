
'use client';

import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface LoadingScreenProps {
  message?: string;
  className?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ message, className }) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div className={cn(
      "flex h-screen w-full flex-col items-center justify-center bg-background",
      // Apply fade-in animation only on the client after mounting to avoid hydration errors
      isMounted ? 'animate-fade-in' : 'opacity-0',
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
        {isMounted && message ? message : <>&nbsp;</>}
      </p>
    </div>
  );
};

export default LoadingScreen;

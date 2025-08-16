
'use client';

import React from 'react';
import LSAIGLogo from '@/components/AuraChatLogo';
import { cn } from '@/lib/utils';

const QuotaExceededScreen: React.FC = () => {
  return (
    <div className={cn(
      "flex h-screen w-full flex-col items-center justify-center bg-background p-4 text-center",
      "animate-fade-in" // Add fade-in animation
    )}>
      <div className="flex flex-col items-center">
        <div className="mb-12">
          <LSAIGLogo />
        </div>
        <h1 className="text-5xl font-thin text-foreground md:text-6xl">
          Keep on looking
          <span className="inline-block animate-[loading-dots-blink_1.4s_infinite_0.2s] [animation-fill-mode:both]">.</span>
          <span className="inline-block animate-[loading-dots-blink_1.4s_infinite_0.4s] [animation-fill-mode:both]">.</span>
          <span className="inline-block animate-[loading-dots-blink_1.4s_infinite_0.6s] [animation-fill-mode:both]">.</span>
        </h1>
        <p className="mt-4 max-w-md text-muted-foreground">
          信任如同一张纸，一旦皱了，即使抚平了，也恢复不了原样。
        </p>
        <p className="mt-6 text-xs text-muted-foreground/50">
          Error Code: 429 Too Many Requests
        </p>
      </div>
    </div>
  );
};

export default QuotaExceededScreen;

    
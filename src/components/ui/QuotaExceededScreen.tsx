
'use client';

import React from 'react';
import SeleneLogo from '@/components/SeleneLogo';
import { cn } from '@/lib/utils';

const QuotaExceededScreen: React.FC = () => {
  return (
    <div className={cn(
      "flex h-screen w-full flex-col items-center justify-center bg-background p-4 text-center",
      "animate-fade-in" // Add fade-in animation
    )}>
      <div className="flex flex-col items-center">
        <div className="mb-8">
          <SeleneLogo />
        </div>
        <div className="w-24 border-t border-muted-foreground/20 mb-8"></div>
        <h1 className="text-5xl font-thin text-foreground md:text-6xl">
          Keep on looking
          <span className="inline-block animate-[loading-dots-blink_1.4s_infinite_0.2s] [animation-fill-mode:both]">.</span>
          <span className="inline-block animate-[loading-dots-blink_1.4s_infinite_0.4s] [animation-fill-mode:both]">.</span>
          <span className="inline-block animate-[loading-dots-blink_1.4s_infinite_0.6s] [animation-fill-mode:both]">.</span>
        </h1>
        <p className="mt-4 max-w-md text-muted-foreground">
          信任就像一面镜子，一旦破碎，虽然可以粘合，但裂痕永远清晰可见。
        </p>
        <p className="mt-6 text-xs text-muted-foreground/50">
          错误代码：破镜难圆
        </p>
      </div>
    </div>
  );
};

export default QuotaExceededScreen;

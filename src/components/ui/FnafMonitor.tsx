
'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface FnafMonitorProps {
  isOpen: boolean;
}

const FnafMonitor: React.FC<FnafMonitorProps> = ({ isOpen }) => {
  return (
    <div
      id="fnaf-monitor"
      className={cn(
        'fixed top-0 right-0 h-full w-[380px] perspective-1000 z-50 pointer-events-none',
        !isOpen && 'hidden'
      )}
    >
      <div
        className={cn(
          'h-full w-full bg-neutral-900 border-l-4 border-neutral-700 shadow-2xl transform-style-preserve-3d origin-right pointer-events-auto',
          isOpen ? 'animate-fnaf-in' : 'animate-fnaf-out'
        )}
      >
        <div className="flex h-full flex-col p-4">
            <div className="flex-grow bg-black rounded-sm overflow-hidden relative">
                <div className="static-noise-bg" />
                <div className="absolute inset-0 bg-black/40" />
                <div className="absolute top-4 left-4 text-white font-mono text-xl">
                    <p data-ai-hint="camera text">CAM 01</p>
                </div>
                <div className="absolute bottom-4 right-4 text-white font-mono text-sm opacity-70">
                    <p>REC ●</p>
                </div>
            </div>
            <div className="flex-shrink-0 h-20 bg-neutral-800 mt-4 rounded-sm">
                {/* Placeholder for buttons */}
            </div>
        </div>
      </div>
    </div>
  );
};

export default FnafMonitor;

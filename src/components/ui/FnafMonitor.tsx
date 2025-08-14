
'use client';

import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Triangle } from 'lucide-react';

interface FnafMonitorProps {
  isOpen: boolean;
}

const FnafMonitor: React.FC<FnafMonitorProps> = ({ isOpen }) => {
  const [shouldRender, setShouldRender] = useState(isOpen);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
    } else {
      // Wait for the animation to finish before unmounting
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 350); // This duration should match the animation duration in CSS

      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!shouldRender) {
    return null;
  }

  return (
    <div
      id="fnaf-monitor"
      className="fixed inset-0 z-50 flex items-center justify-end pointer-events-none perspective-1000"
    >
      <div
        className={cn(
          'w-[600px] h-[500px] bg-yellow-900/80 border-2 border-yellow-600/50 p-2 shadow-2xl transform-style-preserve-3d origin-right pointer-events-auto',
          'transform-gpu', // Improve animation performance
          isOpen ? 'animate-fnaf-in' : 'animate-fnaf-out'
        )}
      >
        <div className="flex h-full w-full flex-col bg-black/80 border border-black relative">
          {/* Screen Content */}
          <div className="flex-grow w-full h-full bg-black rounded-sm overflow-hidden relative">
            <div className="static-noise-bg" />
            <div className="absolute inset-0 bg-black/40" />

            {/* Top Left CAM indicator */}
            <div className="absolute top-4 left-4 text-white/80 font-mono text-2xl tracking-widest">
              <p data-ai-hint="camera text">CAM 01</p>
            </div>

            {/* Top Right Buttons */}
            <div className="absolute top-4 right-4 flex h-20 w-16 flex-col items-center justify-between bg-blue-900/40 p-1 border-2 border-blue-400/30">
                <button className="text-white/80 transition-colors hover:text-white hover:bg-white/10 w-full flex-grow flex items-center justify-center">
                    <Triangle className="h-8 w-8 fill-current" />
                </button>
                <div className="text-white/60 text-xs font-mono">CLICK</div>
                 <button className="text-white/80 transition-colors hover:text-white hover:bg-white/10 w-full flex-grow flex items-center justify-center">
                    <Triangle className="h-8 w-8 fill-current rotate-180" />
                </button>
            </div>

             {/* Bottom Right Map */}
            <div 
              data-ai-hint="security map"
              className="absolute bottom-4 right-4 w-[280px] h-[200px] bg-cover bg-center"
              style={{ backgroundImage: "url('https://i.imgur.com/2sA4R9M.png')" }} 
            />
            
            <div className="absolute bottom-4 left-4 text-white/70 font-mono text-sm opacity-70">
              <p>REC ●</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FnafMonitor;

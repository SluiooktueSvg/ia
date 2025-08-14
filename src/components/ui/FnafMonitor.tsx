
'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Camera, Video } from 'lucide-react';
import Image from 'next/image';

interface FnafMonitorProps {
  isOpen: boolean;
}

const CAMERAS = [
    { id: 'cam01a', name: 'CAM 1A', x: 130, y: 70 },
    { id: 'cam01b', name: 'CAM 1B', x: 130, y: 125 },
    { id: 'cam01c', name: 'CAM 1C', x: 80, y: 125 },
    { id: 'cam02a', name: 'CAM 2A', x: 40, y: 85 },
    { id: 'cam02b', name: 'CAM 2B', x: 40, y: 145 },
    { id: 'cam03', name: 'CAM 3', x: 80, y: 70 },
    { id: 'cam04a', name: 'CAM 4A', x: 220, y: 85 },
    { id: 'cam04b', name: 'CAM 4B', x: 220, y: 145 },
    { id: 'cam05', name: 'CAM 5', x: 130, y: 20 },
    { id: 'cam06', name: 'CAM 6', x: 270, y: 125 },
    { id: 'cam07', name: 'CAM 7', x: 270, y: 70 },
];

const FnafMonitor: React.FC<FnafMonitorProps> = ({ isOpen }) => {
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [currentCameraId, setCurrentCameraId] = useState('cam01a');
  const [isSwitching, setIsSwitching] = useState(false);

  const handleCameraSwitch = (camId: string) => {
    if (camId === currentCameraId) return;

    setIsSwitching(true);
    setCurrentCameraId(camId);

    setTimeout(() => {
        setIsSwitching(false);
    }, 200); // Duration of the static effect in ms
  };

  // Effect for showing/hiding the monitor with animation
  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
    } else {
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 350); 
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const activeCamera = useMemo(() => CAMERAS.find(c => c.id === currentCameraId) || CAMERAS[0], [currentCameraId]);
  const activeImageUrl = useMemo(() => {
    // Using a simple hash from camera ID to generate a placeholder color
    const colorCode = `${activeCamera.id.charCodeAt(3) % 9}${activeCamera.id.charCodeAt(4) % 9}${activeCamera.id.charCodeAt(3) % 9}`;
    return `https://placehold.co/800x600/${colorCode}${colorCode}/ffffff.png`;
  }, [activeCamera]);

  if (!shouldRender) {
    return null;
  }

  const MapRoom = ({ className }: { className?: string }) => (
    <div className={cn("absolute bg-gray-500/10", className)} />
  );

  return (
    <div
      id="fnaf-monitor"
      className="fixed inset-0 z-50 flex items-center justify-end pointer-events-none perspective-1000"
    >
      <div
        className={cn(
          'w-[600px] h-[500px] bg-yellow-900/80 border-2 border-yellow-600/50 p-2 shadow-2xl transform-style-preserve-3d origin-right pointer-events-auto',
          'transform-gpu',
          isOpen ? 'animate-fnaf-in' : 'animate-fnaf-out'
        )}
      >
        <div className="flex h-full w-full flex-col bg-black/80 border border-black relative">
          {/* Screen Content */}
          <div className="flex-grow w-full h-full bg-black rounded-sm overflow-hidden relative">
            
            {/* Camera View */}
            <Image
              key={activeImageUrl} // Force re-render on image change
              src={activeImageUrl}
              alt={`View from ${activeCamera.name}`}
              data-ai-hint="security camera"
              fill={true}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover animate-camera-pan z-0"
            />
            
            {/* Overlay Effects */}
            <div className="camera-vignette" />
            <div className="static-noise-bg" />

            {/* Switching Camera Static Effect */}
            {isSwitching && (
              <div className="camera-switching-noise" />
            )}

            {/* UI Elements */}
            <div className="absolute top-4 left-4 text-white/80 font-mono text-2xl tracking-widest animate-pulse z-30">
              <p>{activeCamera.name}</p>
            </div>

            <div className="absolute top-4 right-4 flex h-20 w-16 flex-col items-center justify-between bg-blue-900/40 p-1 border-2 border-blue-400/30 z-30">
                <button className="text-white/80 transition-colors hover:text-white hover:bg-white/10 w-full flex-grow flex items-center justify-center">
                    <Video className="h-8 w-8" />
                </button>
                 <button className="text-white/80 transition-colors hover:text-white hover:bg-white/10 w-full flex-grow flex items-center justify-center">
                    <Camera className="h-8 w-8" />
                </button>
            </div>

            <div 
              className="absolute bottom-2 right-2 w-[320px] h-[180px] z-30"
            >
              {/* Code-based map layout */}
              <div className="w-full h-full relative">
                {/* Rooms */}
                <MapRoom className="top-[15px] left-[113px] w-[54px] h-[40px]" /> {/* Backstage */}
                <MapRoom className="top-[60px] left-[113px] w-[54px] h-[50px]" /> {/* Show Stage */}
                <MapRoom className="top-[115px] left-[65px] w-[120px] h-[55px]" /> {/* Dining Area */}
                <MapRoom className="top-[60px] left-[65px] w-[43px] h-[50px]" /> {/* Pirate Cove */}
                <MapRoom className="top-[60px] left-[240px] w-[70px] h-[55px]" /> {/* Kitchen */}
                <MapRoom className="top-[120px] left-[240px] w-[70px] h-[50px]" /> {/* Restrooms */}
                <MapRoom className="top-[60px] left-[180px] w-[55px] h-[55px]" /> {/* Supply Closet */}
                
                {/* Halls */}
                <MapRoom className="top-[75px] left-[25px] w-[40px] h-[85px]" /> {/* W. Hall */}
                <MapRoom className="top-[75px] left-[200px] w-[40px] h-[85px]" /> {/* E. Hall */}
                <MapRoom className="top-[165px] left-[113px] w-[54px] h-[10px]" /> {/* Connector */}

                {/* You */}
                <div className="absolute bottom-[-5px] left-[126px] flex items-center justify-center text-white/80">
                  <svg width="20" height="15" viewBox="0 0 20 15"><polygon points="10,0 20,15 0,15" fill="currentColor"/></svg>
                </div>

                {CAMERAS.map(cam => (
                   <button
                      key={cam.id}
                      onClick={() => handleCameraSwitch(cam.id)}
                      className={cn(
                          "absolute w-12 h-6 bg-gray-800/70 border border-gray-500 text-white/80 text-[10px] font-mono flex items-center justify-center transition-all hover:bg-green-500/80 hover:scale-110",
                          currentCameraId === cam.id && "bg-green-600/90 animate-pulse border-white"
                      )}
                      style={{
                          left: `${cam.x}px`,
                          top: `${cam.y}px`,
                          transform: 'translate(-50%, -50%)' // Center the button on the coords
                      }}
                      aria-label={`Switch to ${cam.name}`}
                   >
                      {cam.name}
                   </button>
                ))}
              </div>
            </div>
            
            <div className="absolute bottom-4 left-4 text-white/70 font-mono text-sm opacity-70 z-30">
              <p>REC ●</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FnafMonitor;

    
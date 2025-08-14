
'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Camera, Video } from 'lucide-react';
import Image from 'next/image';

interface FnafMonitorProps {
  isOpen: boolean;
}

const CAMERAS = [
  { id: 'cam1a', name: 'CAM 1A', x: 120, y: 10, imageUrls: ['https://placehold.co/800x600/1a1a1a/333333.png', 'https://placehold.co/800x600/220000/ff0000.png'], hint: 'show stage' },
  { id: 'cam1b', name: 'CAM 1B', x: 105, y: 55, imageUrls: ['https://placehold.co/800x600/2b2b2b/444444.png', 'https://placehold.co/800x600/2b2b2b/333333.png', 'https://placehold.co/800x600/2a0000/ff0000.png'], hint: 'dining area' },
  { id: 'cam1c', name: 'CAM 1C', x: 70, y: 95, imageUrls: ['https://placehold.co/800x600/1f1f1f/3a3a3a.png'], hint: 'pirate cove' },
  { id: 'cam5', name: 'CAM 5', x: 25, y: 65, imageUrls: ['https://placehold.co/800x600/3c3c3c/555555.png', 'https://placehold.co/800x600/3c0000/ff0000.png'], hint: 'backstage' },
  { id: 'cam3', name: 'CAM 3', x: 25, y: 155, imageUrls: ['https://placehold.co/800x600/2a2a2a/4a4a4a.png', 'https://placehold.co/800x600/2a2a2a/3a3a3a.png'], hint: 'supply closet' },
  { id: 'cam2a', name: 'CAM 2A', x: 75, y: 145, imageUrls: ['https://placehold.co/800x600/1e1e1e/3e3e3e.png'], hint: 'west hall' },
  { id: 'cam2b', name: 'CAM 2B', x: 75, y: 175, imageUrls: ['https://placehold.co/800x600/1c1c1c/3c3c3c.png'], hint: 'w. hall corner'},
  { id: 'cam4a', name: 'CAM 4A', x: 135, y: 145, imageUrls: ['https://placehold.co/800x600/2c2c2c/4f4f4f.png', 'https://placehold.co/800x600/2c2c2c/3f3f3f.png', 'https://placehold.co/800x600/2c0000/ff0000.png'], hint: 'east hall' },
  { id: 'cam4b', name: 'CAM 4B', x: 135, y: 175, imageUrls: ['https://placehold.co/800x600/2f2f2f/4a4a4a.png'], hint: 'e. hall corner'},
  { id: 'cam7', name: 'CAM 7', x: 215, y: 65, imageUrls: ['https://placehold.co/800x600/3a3a3a/5a5a5a.png'], hint: 'restrooms' },
  { id: 'cam6', name: 'CAM 6', x: 215, y: 145, imageUrls: ['https://placehold.co/800x600/1e1e1e/3e3e3e.png'], hint: 'kitchen' },
];


// Initialize camera image states
const initialImageStates = CAMERAS.reduce((acc, cam) => {
    acc[cam.id] = { currentImageIndex: 0 };
    return acc;
}, {} as Record<string, { currentImageIndex: number }>);


const FnafMonitor: React.FC<FnafMonitorProps> = ({ isOpen }) => {
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [currentCameraId, setCurrentCameraId] = useState('cam1a');
  const [cameraImageStates, setCameraImageStates] = useState(initialImageStates);

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

  // Effect for changing camera images periodically to simulate activity
  useEffect(() => {
    const imageChangeInterval = setInterval(() => {
      setCameraImageStates(prevStates => {
        const newStates = { ...prevStates };
        // Randomly pick a few cameras to update
        for (let i = 0; i < Math.ceil(CAMERAS.length / 4); i++) {
          const randomCamIndex = Math.floor(Math.random() * CAMERAS.length);
          const camToUpdate = CAMERAS[randomCamIndex];
          if (camToUpdate.imageUrls.length > 1) {
            const currentIdx = newStates[camToUpdate.id].currentImageIndex;
            // Simple logic to just move to the next image, could be random
            const nextIdx = (currentIdx + 1) % camToUpdate.imageUrls.length;
            newStates[camToUpdate.id] = { currentImageIndex: nextIdx };
          }
        }
        return newStates;
      });
    }, 4000); // Change image every 4 seconds

    return () => clearInterval(imageChangeInterval);
  }, []);

  const activeCamera = useMemo(() => CAMERAS.find(c => c.id === currentCameraId) || CAMERAS[0], [currentCameraId]);
  const activeImageUrl = useMemo(() => {
    const state = cameraImageStates[activeCamera.id];
    return activeCamera.imageUrls[state.currentImageIndex];
  }, [activeCamera, cameraImageStates]);


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
              data-ai-hint={activeCamera.hint}
              fill={true}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover animate-camera-pan z-0"
            />
            
            {/* Overlay Effects */}
            <div className="camera-vignette" />
            <div className="static-noise-bg" />


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
              className="absolute bottom-4 right-4 w-[280px] h-[200px] bg-cover bg-center border border-green-400/30 z-30"
              style={{ backgroundImage: "url('https://i.imgur.com/xVTEp7M.png')" }} 
            >
              {CAMERAS.map(cam => (
                 <button
                    key={cam.id}
                    onClick={() => setCurrentCameraId(cam.id)}
                    className={cn(
                        "absolute w-10 h-6 bg-gray-800/50 border border-gray-500 text-white/80 text-xs font-mono flex items-center justify-center transition-all hover:bg-green-500/80 hover:scale-110",
                        currentCameraId === cam.id && "bg-green-600/90 animate-pulse border-white"
                    )}
                    style={{
                        left: `${cam.x}px`,
                        top: `${cam.y}px`
                    }}
                    aria-label={`Switch to ${cam.name}`}
                 >
                    {cam.name.replace('CAM ', '')}
                 </button>
              ))}
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

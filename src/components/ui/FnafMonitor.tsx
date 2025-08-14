
'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Triangle, Camera, Video } from 'lucide-react';
import Image from 'next/image';

interface FnafMonitorProps {
  isOpen: boolean;
}

const CAMERAS = [
  { id: 'cam01', name: 'CAM 01', x: 200, y: 155, imageUrls: ['https://placehold.co/800x600/111/fff', 'https://placehold.co/800x600/111/ddd'], hint: 'office hallway' },
  { id: 'cam02', name: 'CAM 02', x: 200, y: 110, imageUrls: ['https://placehold.co/800x600/222/fff', 'https://placehold.co/800x600/222/ddd', 'https://placehold.co/800x600/222/bbb'], hint: 'dining area' },
  { id: 'cam03', name: 'CAM 03', x: 150, y: 155, imageUrls: ['https://placehold.co/800x600/333/fff'], hint: 'supply closet' },
  { id: 'cam04', name: 'CAM 04', x: 150, y: 110, imageUrls: ['https://placehold.co/800x600/444/fff', 'https://placehold.co/800x600/444/ddd'], hint: 'west hall' },
  { id: 'cam05', name: 'CAM 05', x: 150, y: 65, imageUrls: ['https://placehold.co/800x600/555/fff'], hint: 'backstage' },
  { id: 'cam06', name: 'CAM 06', x: 100, y: 155, imageUrls: ['https://placehold.co/800x600/666/fff'], hint: 'kitchen' },
  { id: 'cam07', name: 'CAM 07', x: 100, y: 110, imageUrls: ['https://placehold.co/800x600/777/fff', 'https://placehold.co/800x600/777/ddd'], hint: 'east hall' },
  { id: 'cam08', name: 'CAM 08', x: 50, y: 110, imageUrls: ['https://placehold.co/800x600/888/fff'], hint: 'storage room' },
];

// Initialize camera image states
const initialImageStates = CAMERAS.reduce((acc, cam) => {
    acc[cam.id] = { currentImageIndex: 0 };
    return acc;
}, {} as Record<string, { currentImageIndex: number }>);


const FnafMonitor: React.FC<FnafMonitorProps> = ({ isOpen }) => {
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [currentCameraId, setCurrentCameraId] = useState('cam01');
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

  // Effect for changing camera images periodically
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
    const camData = CAMERAS.find(c => c.id === currentCameraId);
    if (!camData) return CAMERAS[0].imageUrls[0];
    const state = cameraImageStates[currentCameraId];
    return camData.imageUrls[state.currentImageIndex];
  }, [currentCameraId, cameraImageStates]);


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
          <div className="flex-grow w-full h-full bg-black rounded-sm overflow-hidden relative group/camera-view">
            <div className="static-noise-bg" />
            
            {/* Camera View */}
            <Image
              key={`${activeCamera.id}-${activeImageUrl}`} // Key changes on both camera and image url change
              src={activeImageUrl}
              alt={`View from ${activeCamera.name}`}
              data-ai-hint={activeCamera.hint}
              layout="fill"
              objectFit="cover"
              className="animate-camera-pan"
            />
            <div className="absolute inset-0 bg-black/40" />

            {/* Top Left CAM indicator */}
            <div className="absolute top-4 left-4 text-white/80 font-mono text-2xl tracking-widest animate-pulse">
              <p>{activeCamera.name}</p>
            </div>

            {/* Top Right Buttons */}
            <div className="absolute top-4 right-4 flex h-20 w-16 flex-col items-center justify-between bg-blue-900/40 p-1 border-2 border-blue-400/30">
                <button className="text-white/80 transition-colors hover:text-white hover:bg-white/10 w-full flex-grow flex items-center justify-center">
                    <Video className="h-8 w-8" />
                </button>
                 <button className="text-white/80 transition-colors hover:text-white hover:bg-white/10 w-full flex-grow flex items-center justify-center">
                    <Camera className="h-8 w-8" />
                </button>
            </div>

             {/* Bottom Right Map */}
            <div 
              className="absolute bottom-4 right-4 w-[280px] h-[200px] bg-cover bg-center border border-green-400/30"
              style={{ backgroundImage: "url('https://i.imgur.com/2sA4R9M.png')" }} 
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
                    {cam.name.split(' ')[1]}
                 </button>
              ))}
            </div>
            
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

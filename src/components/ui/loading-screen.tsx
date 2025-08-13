
import React from 'react';
import { Cog } from 'lucide-react';

const LoadingScreen: React.FC = () => {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background">
      <Cog className="h-16 w-16 animate-spin text-primary" />
    </div>
  );
};

export default LoadingScreen;

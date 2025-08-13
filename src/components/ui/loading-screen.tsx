
import React from 'react';
import { Cog } from 'lucide-react';

interface LoadingScreenProps {
  message?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ message }) => {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background">
      <div className="relative h-24 w-24 flex items-center justify-center">
        {/* Engranaje principal grande y lento */}
        <Cog
          className="h-20 w-20 animate-spin-slow text-primary opacity-80"
          strokeWidth={1.5}
        />
        {/* Engranaje secundario mediano, en dirección opuesta */}
        <Cog
          className="absolute h-12 w-12 animate-spin-medium-reverse text-accent opacity-90"
          strokeWidth={1.75}
        />
         {/* Pequeño engranaje rápido en el centro */}
        <Cog
          className="absolute h-6 w-6 animate-spin-fast text-secondary"
          strokeWidth={2}
        />
      </div>
      <p className="mt-4 text-sm text-muted-foreground animate-pulse">
        {message || 'Un momento, por favor...'}
      </p>
    </div>
  );
};

export default LoadingScreen;

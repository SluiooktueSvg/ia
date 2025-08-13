
import React from 'react';

interface LoadingScreenProps {
  text?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ text }) => {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
      {text && <p className="mt-4 text-center text-muted-foreground">{text}</p>}
    </div>
  );
};

export default LoadingScreen;

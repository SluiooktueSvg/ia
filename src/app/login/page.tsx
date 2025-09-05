
'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import SeleneLogo from '@/components/SeleneLogo';
import LoadingScreen from '@/components/ui/loading-screen';
import GoogleLogo from '@/components/GoogleLogo';

export default function LoginPage() {
  const { user, signInWithGoogle, loading } = useAuth();
  const router = useRouter();
  const interactionSoundRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!loading && user) {
      if (user.displayName?.toLowerCase().includes('dayana')) {
        router.push('/admin');
      } else {
        router.push('/chat');
      }
    }
  }, [user, loading, router]);
  
  useEffect(() => {
    interactionSoundRef.current = new Audio('/sounds/open-ended.mp3');
    interactionSoundRef.current.preload = 'auto';
  }, []);

  const handleSignIn = async () => {
    try {
      interactionSoundRef.current?.play().catch(e => console.error("Audio playback failed", e));
      await signInWithGoogle();
    } catch (error) {
      console.error(error)
    }
  };
  
  if (loading || user) {
    return <LoadingScreen />;
  }

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background p-4">
      <div className="flex max-w-sm flex-col items-center text-center">
        <SeleneLogo />
        <h1 className="text-2xl font-semibold mt-4">Welcome to Selene</h1>
        <p className="text-muted-foreground mt-2">Sign in to start chatting with the AI.</p>
        <Button onClick={handleSignIn} className="mt-6 w-full">
          <GoogleLogo className="mr-2 h-5 w-5" />
          Sign In with Google
        </Button>
      </div>
    </div>
  );
}

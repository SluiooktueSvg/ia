
'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import LSAIGLogo from '@/components/AuraChatLogo';
import LoadingScreen from '@/components/ui/loading-screen';

export default function LoginPage() {
  const { user, signInWithGoogle, loading } = useAuth();
  const router = useRouter();
  const interactionSoundRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // This effect will run when the component mounts and whenever user or loading changes.
    // It will redirect if the user is already logged in and the initial auth check is complete.
    if (!loading && user) {
      router.push('/chat');
    }
  }, [user, loading, router]);
  
  useEffect(() => {
    // Pre-load the audio on component mount
    interactionSoundRef.current = new Audio('/sounds/open-ended.mp3');
    interactionSoundRef.current.preload = 'auto';
  }, []);

  const handleSignIn = async () => {
    try {
      // Play the sound first
      interactionSoundRef.current?.play().catch(e => console.error("Audio playback failed", e));
      // Then proceed with sign-in
      await signInWithGoogle();
      // After a successful sign-in, the useEffect above will catch the user change and redirect.
    } catch (error) {
      // The error is already logged in the context, no need to log it again here.
      // The page will remain as is, allowing the user to try again.
    }
  };
  
  // Show a loading screen only during the initial authentication check on page load or if a user is already logged in (and we're about to redirect).
  if (loading || user) {
    return <LoadingScreen />;
  }

  // Default view: Show the login page for non-authenticated, non-loading state.
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background p-4">
      <div className="flex max-w-sm flex-col items-center text-center">
        <LSAIGLogo />
        <h1 className="text-2xl font-semibold mt-4">Welcome to LSAIG</h1>
        <p className="text-muted-foreground mt-2">Sign in to start chatting with the AI.</p>
        <Button onClick={handleSignIn} className="mt-6 w-full">
          Sign In with Google
        </Button>
      </div>
    </div>
  );
}

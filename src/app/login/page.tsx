
'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import LSAIGLogo from '@/components/AuraChatLogo';
import LoadingScreen from '@/components/ui/loading-screen';

export default function LoginPage() {
  const { user, signInWithGoogle, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/chat');
    }
  }, [user, loading, router]);

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
      // After the popup is successful, the `useEffect` above will catch the user change and redirect.
    } catch (error) {
      console.error("Sign-in process was interrupted or failed:", error);
    }
  };
  
  // While the initial user state is loading, show a loading screen.
  if (loading && !user) {
    return <LoadingScreen />;
  }

  // If a user is logged in, we are about to redirect via the useEffect, so show a loading screen.
  if (user) {
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

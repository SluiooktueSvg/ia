
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

  // This effect handles the case where a user is already logged in when they visit the page.
  useEffect(() => {
    if (!loading && user) {
      router.push('/chat');
    }
  }, [user, loading, router]);

  const handleSignIn = async () => {
    try {
      // The `signInWithGoogle` function will trigger an auth state change,
      // which the useEffect above will catch on the next render, causing a redirect.
      await signInWithGoogle();
    } catch (error) {
      console.error("Sign-in failed:", error);
      // Optionally, show a toast or message to the user here
    }
  };
  
  // If loading, and we don't have a user yet, show the login page.
  // This prevents the page from unmounting the button during the sign-in process.
  // We only show a loading screen if we are absolutely sure we're about to redirect.
  if (loading) {
    return <LoadingScreen />;
  }
  
  // If we have a user, we are about to redirect, so we can return null or a loading screen.
  if (user) {
    return <LoadingScreen />;
  }

  // Default view: Show the login page for non-authenticated users.
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

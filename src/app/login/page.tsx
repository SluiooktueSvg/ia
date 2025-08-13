
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
    if (user) {
      router.push('/chat');
    }
  }, [user, router]);

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Sign-in failed:", error);
      // Optionally, show a toast or message to the user
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }
  
  if (user) {
    return null; // Don't render anything while redirecting
  }

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

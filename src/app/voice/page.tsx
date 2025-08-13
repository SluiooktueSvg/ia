
'use client';

import VoiceInterface from '@/components/voice/VoiceInterface';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import LoadingScreen from '@/components/ui/loading-screen';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';

export default function VoiceChatPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return <LoadingScreen />;
  }

  return (
    <div className="relative flex h-screen w-full flex-col items-center justify-center bg-background">
       <div className="absolute top-4 right-4">
        <Button asChild variant="outline">
          <Link href="/chat">
            <MessageCircle className="mr-2 h-4 w-4" />
            Chat de Texto
          </Link>
        </Button>
      </div>
      <VoiceInterface />
    </div>
  );
}

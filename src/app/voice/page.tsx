
'use client';

import VoiceInterface from '@/components/voice/VoiceInterface';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import LoadingScreen from '@/components/ui/loading-screen';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

export default function VoiceChatPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);

  useEffect(() => {
    // Registra el tiempo de inicio cuando el componente se monta
    setSessionStartTime(Date.now());
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return <LoadingScreen />;
  }

  const chatHref = sessionStartTime
    ? `/chat?voiceSessionStart=${sessionStartTime}`
    : '/chat';

  return (
    <div className="relative flex h-screen w-full flex-col items-center justify-center bg-background">
      <VoiceInterface />
      <div className="absolute bottom-8">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button asChild variant="secondary" size="icon" className="h-14 w-14 rounded-full">
                <Link href={chatHref} scroll={false}>
                  <MessageCircle className="h-7 w-7" />
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" sideOffset={10}>
              <p>Volver al Chat de Texto</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}

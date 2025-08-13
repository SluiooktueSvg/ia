
'use client';

import ChatLayout from '@/components/chat/ChatLayout';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import LoadingScreen from '@/components/ui/loading-screen';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceStrict } from 'date-fns';
import { es } from 'date-fns/locale';

export const dynamic = 'force-dynamic';

export default function AuraChatPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const startTimeParam = searchParams.get('voiceSessionStart');
    if (startTimeParam) {
      const startTime = parseInt(startTimeParam, 10);
      const endTime = Date.now();
      const duration = formatDistanceStrict(new Date(startTime), new Date(endTime), {
        locale: es,
        roundingMethod: 'round',
      });
      
      toast({
        title: "Sesión de Voz Terminada",
        description: `La conversación por voz duró ${duration}.`,
      });

      // Limpia los parámetros de la URL sin recargar la página
      router.replace('/chat', { scroll: false });
    }
  }, [searchParams, router, toast]);

  if (loading || !user) {
    return <LoadingScreen text="Cargando tu sesión..." />;
  }

  return <ChatLayout />;
}


'use client';

import ChatLayout from '@/components/chat/ChatLayout';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import LoadingScreen from '@/components/ui/loading-screen';

export const dynamic = 'force-dynamic';

export default function AuraChatPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return <LoadingScreen text="Cargando tu sesión..." />;
  }

  return <ChatLayout />;
}

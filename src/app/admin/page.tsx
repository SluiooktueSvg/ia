
'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import LoadingScreen from '@/components/ui/loading-screen';
import SeleneLogo from '@/components/SeleneLogo';
import { Button } from '@/components/ui/button';
import { LogOut, Terminal } from 'lucide-react';

export default function AdminPage() {
    const { user, loading, logout } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.push('/login');
            } else if (!user.displayName?.toLowerCase().includes('luis')) {
                router.push('/chat');
            }
        }
    }, [user, loading, router]);

    if (loading || !user || !user.displayName?.toLowerCase().includes('luis')) {
        return <LoadingScreen />;
    }

    return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-black p-4 text-center">
            <div className="absolute top-5 left-5">
                <SeleneLogo variant="terminal" />
            </div>
            <div className="max-w-md">
                <h1 className="text-7xl font-bold text-red-500 font-code animate-pulse">Oops.</h1>
                <p className="mt-4 text-lg text-neutral-300 font-code">
                    Error de sistema: Conexión con el núcleo de Selene interrumpida.
                </p>
                <p className="mt-2 text-sm text-neutral-500 font-code">
                   Se ha detectado una fluctuación en la matriz de empatía. Imposible renderizar la interfaz de creador. Por favor, revise el estabilizador de positrones y vuelva a intentarlo.
                </p>
                 <p className="mt-6 text-xs text-green-500/30 font-code">
                    ERROR_CODE: KERNEL_CONNECTION_LOST_7F8C1
                 </p>
            </div>

            <footer className="absolute bottom-4 text-center text-xs text-green-500/30 font-code">
                 <p>&copy; {new Date().getFullYear()} Selene System Interface. Fallo Crítico.</p>
                 <p>Build: Creator_Interface_Failure | Sluiooktue Inc.</p>
            </footer>
        </div>
    );
}

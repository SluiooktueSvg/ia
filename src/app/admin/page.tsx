
'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import LoadingScreen from '@/components/ui/loading-screen';
import SeleneLogo from '@/components/SeleneLogo';
import { Button } from '@/components/ui/button';
import { ArrowRight, LogOut } from 'lucide-react';

const CreatorTerminal: React.FC = () => {
    const [lines, setLines] = useState<string[]>([]);
    const creatorName = "LMC"; 
    const bootSequence = [
        "INITIATING BOOT SEQUENCE...",
        "LOADING SELENE KERNEL V1.3.3.7...",
        "CHECKING SYSTEM INTEGRITY...",
        "ENCRYPTION: AES-256...OK",
        "AUTH MODULE...OK",
        "GENKIT AI CORE...OK",
        `AUTHENTICATING USER: ${creatorName}...`,
        "ACCESS GRANTED.",
        `WELCOME, CREATOR ${creatorName}.`,
        "ALL SYSTEMS NOMINAL. STANDING BY FOR COMMAND.",
        "_",
    ];

    useEffect(() => {
        let currentIndex = 0;
        const intervalId = setInterval(() => {
            if (currentIndex < bootSequence.length) {
                setLines(prev => {
                    const newLines = [...prev];
                    const currentLineText = bootSequence[currentIndex];
                    if (currentLineText === "_") {
                         newLines[newLines.length - 1] += '<span class="animate-cmd-cursor-blink">_</span>';
                    } else if (currentIndex > 0 && bootSequence[currentIndex-1] !== "_") {
                        // Replace the cursor from the previous line with the full line
                        newLines[newLines.length - 1] = bootSequence[currentIndex-1];
                        newLines.push(currentLineText);
                    } else {
                        newLines.push(currentLineText);
                    }
                    return newLines;
                });
                currentIndex++;
            } else {
                clearInterval(intervalId);
            }
        }, 300);

        return () => clearInterval(intervalId);
    }, []);

    return (
        <div className="bg-black text-green-500 font-code p-4 md:p-6 rounded-lg border border-green-900/50 h-full w-full overflow-y-auto">
            {lines.map((line, index) => (
                <p key={index} className="whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: line }} />
            ))}
        </div>
    );
};

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
        <div className="flex h-screen w-full flex-col items-center justify-center bg-black p-4">
            <div className="absolute top-5 left-5">
                <SeleneLogo variant="terminal" />
            </div>
             <div className="absolute top-5 right-5 flex gap-2">
                <Button variant="outline" size="sm" onClick={() => router.push('/chat')}>
                    Go to Chat <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button variant="destructive" size="sm" onClick={logout}>
                    Logout <LogOut className="ml-2 h-4 w-4" />
                </Button>
            </div>
            <div className="w-full max-w-4xl h-[70vh]">
                 <CreatorTerminal />
            </div>
            <footer className="absolute bottom-4 text-center text-xs text-green-500/30 font-code">
                 <p>&copy; {new Date().getFullYear()} Selene System Interface. All rights reserved.</p>
                 <p>Creator Build | Sluiooktue Inc.</p>
            </footer>
        </div>
    );
}

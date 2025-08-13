
'use client';

import React, { useState, useEffect, MouseEvent, useRef } from 'react';
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import { useChatController } from '@/hooks/useChatController';
import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import LSAIGLogo from '@/components/AuraChatLogo';
import { Button } from '@/components/ui/button';
import { Save, FolderOpen, Trash2, Heart, LogOut, AudioLines } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

const helpMessages = [
  "¿En qué puedo asistirte hoy?",
  "¿Listo para explorar algunas ideas?",
  "¿Sobre qué te gustaría conversar?",
  "Estoy aquí para ayudarte. ¿Qué tienes en mente?",
  "¿Cómo puedo hacer tu día un poco mejor?",
  "Pregúntame lo que sea, ¡estoy para ayudarte!",
  "¿Qué curiosidad podemos resolver hoy?",
  "Dime, ¿qué necesitas descubrir o crear?",
  "¡Hola! ¿Qué aventura iniciamos hoy?",
  "Estoy lista para tus preguntas. ¿Por dónde empezamos?",
  "¿Tienes alguna duda o idea? ¡Compártela conmigo!",
  "Exploremos juntos. ¿Qué tema te interesa?",
  "Tu asistente virtual a la orden. ¿Qué puedo hacer por ti?",
  "¿Listo para una charla productiva y amena?",
  "Cuéntame, ¿qué proyecto o pregunta traes entre manos?",
  "La curiosidad es el primer paso al conocimiento. ¿Qué te intriga hoy?",
  "¿Necesitas inspiración o información? Estoy a un clic.",
  "¿En qué puedo ayudarte a pensar o resolver?",
  "Conversemos un rato, ¿qué te apetece explorar?",
  "Estoy lista para procesar tus ideas y preguntas.",
  "La IA está aquí para ti. ¿Cómo empezamos?",
  "Pregunta, crea, descubre. ¡Estoy para asistirte!",
  "¿Qué misterios resolveremos hoy?",
  "Tu socio de ideas está listo. ¿Comenzamos?",
  "¿Hay algo nuevo que quieras aprender o discutir?",
  "Siempre es un buen momento para una nueva pregunta.",
  "¿Cómo puedo ser de utilidad en este momento?",
  "Estoy escuchando. ¿Qué se te ocurre?",
  "La inteligencia artificial a tu servicio. ¿Qué exploramos?",
  "¿Tienes un desafío? ¡Vamos a enfrentarlo juntos!",
  "Conversemos sobre lo que más te interese.",
];

interface ActiveHeart {
  id: string;
  x: number;
  y: number;
}

interface ActiveRipple {
  id: string;
  x: number;
  y: number;
}


const CLICK_THRESHOLD = 3;
const CLICK_TIMEOUT_MS = 500;
const HEART_ANIMATION_DURATION_MS = 2000;
const HEARTS_PER_BURST = 5;
const RIPPLE_ANIMATION_DURATION_MS = 800; // Adjusted to match new animation duration

const ANIMATION_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789*&%$#@!";
const GREETING_ANIMATION_INTERVAL_MS = 60; 
const GREETING_REVEAL_SPEED_FACTOR = 3; 
const GREETING_TIME_CHECK_INTERVAL_MS = 60000; // Check time every 1 minute

const ChatLayout: React.FC = () => {
  const {
    messages,
    currentInput,
    setCurrentInput,
    hasSentFirstMessage,
    sendMessage,
    clearChat,
    saveChat,
    loadChat,
    handleAudioGenerated,
    handleAudioError,
    isTtsQuotaExceeded,
    setIsTtsQuotaExceeded,
  } = useChatController();
  const { user, logout } = useAuth();

  const [greetingPrefix, setGreetingPrefix] = useState('');
  const [targetDynamicGreetingPart, setTargetDynamicGreetingPart] = useState('');
  const [animatedGreetingDisplay, setAnimatedGreetingDisplay] = useState('');
  const [dynamicHelpText, setDynamicHelpText] = useState('');
  const { toast } = useToast();

  const [clickCount, setClickCount] = useState(0);
  const [lastClickTime, setLastClickTime] = useState(0);
  const [activeHearts, setActiveHearts] = useState<ActiveHeart[]>([]);
  const [activeRipples, setActiveRipples] = useState<ActiveRipple[]>([]);
  const currentGreetingInfoRef = useRef<{prefix: string, dynamicPart: string} | null>(null);

  const getGreetingInfo = (userName?: string | null) => {
    const currentHour = new Date().getHours();
    const name = userName ? `, ${userName.split(' ')[0]}` : ''; // Get first name
    if (currentHour < 12) {
      return { prefix: 'Buenos ', dynamicPart: `días${name}` };
    } else if (currentHour < 18) {
      return { prefix: 'Buenas ', dynamicPart: `tardes${name}` };
    } else {
      return { prefix: 'Buenas ', dynamicPart: `noches${name}` };
    }
  };
  
  // Effect to update target greeting based on time of day
  useEffect(() => {
    const updateAndAnimateGreetingIfNeeded = () => {
      const { prefix, dynamicPart } = getGreetingInfo(user?.displayName);
      if (
        !currentGreetingInfoRef.current ||
        prefix !== currentGreetingInfoRef.current.prefix ||
        dynamicPart !== currentGreetingInfoRef.current.dynamicPart
      ) {
        setGreetingPrefix(prefix);
        setTargetDynamicGreetingPart(dynamicPart); 
        currentGreetingInfoRef.current = { prefix, dynamicPart };
      }
    };

    updateAndAnimateGreetingIfNeeded(); // Initial determination

    const timeCheckIntervalId = setInterval(updateAndAnimateGreetingIfNeeded, GREETING_TIME_CHECK_INTERVAL_MS);
    return () => clearInterval(timeCheckIntervalId);
  }, [user]); // Re-run when user object changes


  // Effect to run scramble animation when targetDynamicGreetingPart or greetingPrefix changes
  useEffect(() => {
    if (!targetDynamicGreetingPart || !greetingPrefix) {
      setAnimatedGreetingDisplay(''); // Clear if no target
      return;
    }
    
    // Prevent re-animation if the display already matches the target
    if (animatedGreetingDisplay === greetingPrefix + targetDynamicGreetingPart && animatedGreetingDisplay !== greetingPrefix) {
        return;
    }

    let animationTimeoutId: NodeJS.Timeout;
    let currentScrambledVisualPart = "";
    for (let i = 0; i < targetDynamicGreetingPart.length; i++) {
      currentScrambledVisualPart += ANIMATION_CHARS[Math.floor(Math.random() * ANIMATION_CHARS.length)];
    }
    setAnimatedGreetingDisplay(greetingPrefix + currentScrambledVisualPart);

    let animationProgressCount = 0;
    let charactersRevealed = 0;
    
    const animate = () => {
      if (charactersRevealed >= targetDynamicGreetingPart.length) {
        setAnimatedGreetingDisplay(greetingPrefix + targetDynamicGreetingPart); // Final correct greeting
        return; // Animation complete
      }

      animationProgressCount++;
      
      let nextScrambledVisualPart = "";
      for (let i = 0; i < targetDynamicGreetingPart.length; i++) {
        if (i < charactersRevealed) {
          nextScrambledVisualPart += targetDynamicGreetingPart[i];
        } else {
          nextScrambledVisualPart += ANIMATION_CHARS[Math.floor(Math.random() * ANIMATION_CHARS.length)];
        }
      }
      setAnimatedGreetingDisplay(greetingPrefix + nextScrambledVisualPart);

      if (animationProgressCount % GREETING_REVEAL_SPEED_FACTOR === 0 && charactersRevealed < targetDynamicGreetingPart.length) {
        charactersRevealed++;
      }
      animationTimeoutId = setTimeout(animate, GREETING_ANIMATION_INTERVAL_MS);
    };

    animate(); // Start the animation
    
    return () => {
      clearTimeout(animationTimeoutId); // Cleanup on unmount or if dependencies change
    };
  }, [targetDynamicGreetingPart, greetingPrefix]); // Re-run animation if target part or prefix changes

  useEffect(() => {
    setDynamicHelpText(helpMessages[Math.floor(Math.random() * helpMessages.length)]);
  }, []);


  const handlePageClick = (event: MouseEvent<HTMLDivElement>) => {
    // --- Ripple Effect ---
    const newRippleId = `ripple-${Date.now()}-${Math.random()}`;
    const newRipple: ActiveRipple = {
      id: newRippleId,
      x: event.clientX,
      y: event.clientY,
    };
    setActiveRipples(prevRipples => [...prevRipples, newRipple]);
    setTimeout(() => {
      setActiveRipples(prev => prev.filter(r => r.id !== newRippleId));
    }, RIPPLE_ANIMATION_DURATION_MS);

    // --- Heart Burst Effect ---
    if ((event.target as HTMLElement).closest('#chat-input-form')) {
      return;
    }
    const currentTime = Date.now();
    let newClickCount;
    if (currentTime - lastClickTime > CLICK_TIMEOUT_MS) {
      newClickCount = 1;
    } else {
      newClickCount = clickCount + 1;
    }
    setClickCount(newClickCount);
    setLastClickTime(currentTime);

    if (newClickCount >= CLICK_THRESHOLD) { 
      const heartsToSpawn: ActiveHeart[] = [];
      for (let i = 0; i < HEARTS_PER_BURST; i++) {
        const newHeartId = `heart-${currentTime}-${Math.random()}-${i}`;
        heartsToSpawn.push({ id: newHeartId, x: event.clientX, y: event.clientY });
        
        setTimeout(() => {
          setActiveHearts(prevHearts => prevHearts.filter(h => h.id !== newHeartId));
        }, HEART_ANIMATION_DURATION_MS);
      }
      setActiveHearts(prevHearts => [...prevHearts, ...heartsToSpawn]);
      setClickCount(0); // Reset click count after burst
    }
  };

  return (
    <SidebarInset
      className="flex h-screen flex-col bg-background md:m-0 md:rounded-none md:shadow-none"
      onClick={handlePageClick}
    >
      <div className="flex items-center justify-between p-3 md:p-4">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="md:hidden" />
          <LSAIGLogo />
        </div>
        <div className="flex items-center gap-1 rounded-full bg-card p-1 shadow-md">
          <Button asChild variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:scale-110 transition-transform duration-150 md:h-9 md:w-9" aria-label="Voice chat">
            <Link href="/voice">
              <AudioLines className="h-4 w-4 md:h-5 md:w-5" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" onClick={saveChat} aria-label="Save chat" className="h-8 w-8 rounded-full hover:animate-pulse-custom md:h-9 md:w-9">
            <Save className="h-4 w-4 md:h-5 md:w-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={loadChat} aria-label="Load chat" className="h-8 w-8 rounded-full hover:scale-110 transition-transform duration-150 md:h-9 md:w-9">
            <FolderOpen className="h-4 w-4 md:h-5 md:w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              clearChat();
            }}
            aria-label="Clear chat"
            className="h-8 w-8 rounded-full text-destructive hover:text-destructive hover:bg-destructive/10 hover:animate-shake md:h-9 md:w-9"
          >
            <Trash2 className="h-4 w-4 md:h-5 md:w-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={logout} aria-label="Log out" className="h-8 w-8 rounded-full hover:scale-110 transition-transform duration-150 md:h-9 md:w-9">
            <LogOut className="h-4 w-4 md:h-5 md:w-5" />
          </Button>
        </div>
      </div>

      <div className={cn("flex flex-1 flex-col", hasSentFirstMessage ? "h-full" : "min-h-0")}>
        {hasSentFirstMessage ? (
          <>
            <MessageList 
              messages={messages} 
              onAudioGenerated={handleAudioGenerated}
              onAudioError={handleAudioError}
              isTtsQuotaExceeded={isTtsQuotaExceeded}
              setIsTtsQuotaExceeded={setIsTtsQuotaExceeded}
            />
            <ChatInput
              currentMessage={currentInput}
              setCurrentMessage={setCurrentInput}
              onSendMessage={sendMessage}
              isCentered={false}
            />
          </>
        ) : (
          <div className="flex h-full flex-col">
            <div className="flex flex-1 flex-shrink items-center justify-center overflow-y-auto p-4">
              <div className="w-full max-w-xl text-center">
                <div className="mb-4">
                  {animatedGreetingDisplay && <p className="text-3xl font-semibold text-gradient-animated md:text-4xl">{animatedGreetingDisplay}</p>}
                  {dynamicHelpText && <p className="mt-2 text-sm text-muted-foreground md:text-base">{dynamicHelpText}</p>}
                </div>
                <ChatInput
                  currentMessage={currentInput}
                  setCurrentMessage={setCurrentInput}
                  onSendMessage={sendMessage}
                  isCentered={true}
                />
              </div>
            </div>
            <footer className="flex-shrink-0 px-4 py-4 text-center text-xs text-muted-foreground">
              <p>&copy; {new Date().getFullYear()} LSAIG. All rights reserved.</p>
              <p>Sluiooktue Inc. Luis M.</p>
            </footer>
          </div>
        )}
      </div>
      
      {/* Ripple Effect Renderer */}
      {activeRipples.map(ripple => (
        <div
          key={ripple.id}
          className="absolute h-1 w-1 rounded-full animate-ripple-effect"
          style={{
            left: ripple.x,
            top: ripple.y,
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
            zIndex: 9998,
            boxShadow: '0 0 0 0 hsl(var(--primary))',
          }}
        />
      ))}
      
      {/* Heart Burst Effect Renderer */}
      {activeHearts.map(heart => (
        <Heart
          key={heart.id}
          className="absolute text-red-500 animate-float-fade"
          style={{
            left: `${heart.x}px`,
            top: `${heart.y}px`,
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
            zIndex: 9999,
          }}
          size={24}
          fill="currentColor"
        />
      ))}
    </SidebarInset>
  );
};

export default ChatLayout;

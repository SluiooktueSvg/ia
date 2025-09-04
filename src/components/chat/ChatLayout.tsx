
'use client';

import React, { useState, useEffect, MouseEvent, useRef } from 'react';
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import { useChatController } from '@/hooks/useChatController';
import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import SeleneLogo from '@/components/SeleneLogo';
import { Button } from '@/components/ui/button';
import { Save, FolderOpen, Trash2, Heart, LogOut, AudioLines, Camera } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { cn, inferGenderFromName } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import FnafMonitor from '@/components/ui/FnafMonitor';
import QuotaExceededScreen from '@/components/ui/QuotaExceededScreen';

const helpMessages = [
  { male: "¿En qué puedo ayudarte hoy?", female: "¿En qué puedo ayudarte hoy?" },
  { male: "¿Listo para explorar algunas ideas?", female: "¿Listo para explorar algunas ideas?" },
  { male: "¿Sobre qué te gustaría conversar?", female: "¿Sobre qué te gustaría conversar?" },
  { male: "Estoy aquí para ayudarte. ¿Qué tienes en mente?", female: "Estoy aquí para ayudarte. ¿Qué tienes en mente?" },
  { male: "¿Cómo puedo hacer tu día un poco mejor?", female: "¿Cómo puedo hacer tu día un poco mejor?" },
  { male: "Pregúntame lo que sea, ¡estoy para ayudarte!", female: "Pregúntame lo que sea, ¡estoy para asistirte!" },
  { male: "¿Qué curiosidad podemos resolver hoy?", female: "¿Qué curiosidad podemos resolver hoy?" },
  { male: "Dime, ¿qué necesitas descubrir o crear?", female: "Dime, ¿qué necesitas descubrir o crear?" },
  { male: "¡Hola! ¿Qué aventura iniciamos hoy?", female: "¡Hola! ¿Qué aventura iniciamos hoy?" },
  { male: "Estoy a tu disposición. ¿Por dónde empezamos?", female: "Estoy a tu disposición. ¿Por dónde empezamos?" },
  { male: "¿Tienes alguna duda o idea? ¡Compártela conmigo!", female: "¿Tienes una duda o idea? ¡Compártela conmigo!" },
  { male: "Exploremos juntos. ¿Qué tema te interesa?", female: "Exploremos juntos. ¿Qué tema te interesa?" },
  { male: "Tu asistente virtual a la orden. ¿Qué puedo hacer por ti?", female: "Tu asistente virtual a la orden. ¿Qué puedo hacer por ti?" },
  { male: "¿Listo para una charla productiva y amena?", female: "¿Lista para una charla productiva y amena?" },
  { male: "Cuéntame, ¿qué proyecto o pregunta traes entre manos?", female: "Cuéntame, ¿qué proyecto o pregunta traes entre manos?" },
  { male: "La curiosidad es el primer paso al conocimiento. ¿Qué te intriga hoy?", female: "La curiosidad es el primer paso al conocimiento. ¿Qué te intriga hoy?" },
  { male: "¿Necesitas inspiración o información? Estoy a un clic.", female: "¿Necesitas inspiración o información? Estoy a un clic." },
  { male: "¿En qué puedo ayudarte a pensar o resolver?", female: "¿En qué puedo ayudarte a pensar o resolver?" },
  { male: "Conversemos un rato, ¿qué te apetece explorar?", female: "Conversemos un rato, ¿qué te apetece explorar?" },
  { male: "Mi sistema está listo para procesar tus ideas y preguntas.", female: "Mi sistema está listo para procesar tus ideas y preguntas." },
  { male: "La IA está aquí para ti. ¿Cómo empezamos?", female: "La IA está aquí para ti. ¿Cómo empezamos?" },
  { male: "Pregunta, crea, descubre. ¡Estoy para asistirte!", female: "Pregunta, crea, descubre. ¡Estoy para asistirte!" },
  { male: "¿Qué misterios resolveremos hoy?", female: "¿Qué misterios resolveremos hoy?" },
  { male: "Tu asistente de ideas está operativo. ¿Comenzamos?", female: "Tu asistente de ideas está operativo. ¿Comenzamos?" },
  { male: "¿Hay algo nuevo que quieras aprender o discutir?", female: "¿Hay algo nuevo que quieras aprender o discutir?" },
  { male: "Siempre es un buen momento para una nueva pregunta.", female: "Siempre es un buen momento para una nueva pregunta." },
  { male: "¿Cómo puedo ser de utilidad en este momento?", female: "¿Cómo puedo ser de utilidad en este momento?" },
  { male: "Estoy escuchando. ¿Qué se te ocurre?", female: "Estoy escuchando. ¿Qué se te ocurre?" },
  { male: "La inteligencia artificial a tu servicio. ¿Qué exploramos?", female: "La inteligencia artificial a tu servicio. ¿Qué exploramos?" },
  { male: "¿Tienes un desafío? ¡Vamos a enfrentarlo juntos!", female: "¿Tienes un desafío? ¡Vamos a enfrentarlo juntos!" },
  { male: "Conversemos sobre lo que más te interese.", female: "Conversemos sobre lo que más te interese." },
];


interface ActiveHeart {
  id: string;
  x: number;
  y: number;
}

const CLICK_THRESHOLD = 3;
const CLICK_TIMEOUT_MS = 500;
const HEART_ANIMATION_DURATION_MS = 2000;
const HEARTS_PER_BURST = 5;

const WORD_CHANGE_INTERVAL_MS = 2500; // Time between word changes

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
    isAiThinking,
    isQuotaExceeded,
  } = useChatController();
  const { user, logout } = useAuth();

  const [greetingPrefix, setGreetingPrefix] = useState('');
  const [rotatingWords, setRotatingWords] = useState<string[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [animationClass, setAnimationClass] = useState('animate-slide-in-down');

  const [dynamicHelpText, setDynamicHelpText] = useState('');
  
  const [clickCount, setClickCount] = useState(0);
  const [lastClickTime, setLastClickTime] = useState(0);
  const [activeHearts, setActiveHearts] = useState<ActiveHeart[]>([]);
  
  const [isMonitorOpen, setIsMonitorOpen] = useState(false);

  // Effect to set up greeting and rotating words
  useEffect(() => {
    const currentHour = new Date().getHours();
    let prefix = '';
    if (currentHour < 12) {
      prefix = 'Buenos días,';
    } else if (currentHour < 18) {
      prefix = 'Buenas tardes,';
    } else {
      prefix = 'Buenas noches,';
    }
    setGreetingPrefix(prefix);
    
    const name = user?.displayName?.split(' ')[0] || 'Humano';
    const gender = user?.displayName ? inferGenderFromName(user.displayName) : 'male';
    
    const words = [
      name,
      'explorador' + (gender === 'female' ? 'a' : ''),
      'amigo' + (gender === 'female' ? 'a' : ''),
      'creador' + (gender === 'female' ? 'a' : ''),
      'crack',
      'campeón' + (gender === 'female' ? 'a' : ''),
    ];
    setRotatingWords(words);
  }, [user]);

  // Effect for rotating words animation
  useEffect(() => {
    if (rotatingWords.length === 0) return;

    const intervalId = setInterval(() => {
      setAnimationClass('animate-slide-out-up'); // Animate out

      setTimeout(() => {
        setCurrentWordIndex(prevIndex => (prevIndex + 1) % rotatingWords.length);
        setAnimationClass('animate-slide-in-down'); // Animate in
      }, 500); // Wait for out animation to finish
    }, WORD_CHANGE_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [rotatingWords]);

  useEffect(() => {
    const randomMessage = helpMessages[Math.floor(Math.random() * helpMessages.length)];
    const userGender = user?.displayName ? inferGenderFromName(user.displayName) : 'male';
    setDynamicHelpText(randomMessage[userGender]);
  }, [user]);


  const handlePageClick = (event: MouseEvent<HTMLDivElement>) => {
    // --- Heart Burst Effect ---
    if ((event.target as HTMLElement).closest('#chat-input-form') || (event.target as HTMLElement).closest('#fnaf-monitor')) {
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
  
  if (isQuotaExceeded) {
    return <QuotaExceededScreen />;
  }

  return (
    <div className="relative h-screen w-full">
      <SidebarInset
        className="flex h-screen flex-col bg-background md:m-0 md:rounded-none md:shadow-none animate-fade-in"
        onClick={handlePageClick}
      >
        <div className="flex items-center justify-between p-3 md:p-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="md:hidden" />
            <SeleneLogo />
          </div>
          <div className="flex items-center gap-1 rounded-full bg-card p-1 shadow-md">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-full hover:scale-110 transition-transform duration-150 md:h-9 md:w-9" 
              aria-label="Toggle camera monitor"
              onClick={() => setIsMonitorOpen(!isMonitorOpen)}
            >
              <Camera className="h-4 w-4 md:h-5 md:w-5" />
            </Button>
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

        <div className="flex-1 flex flex-col h-full min-h-0">
          {hasSentFirstMessage ? (
            <div className="flex h-full flex-col flex-shrink-0">
              <MessageList 
                className="flex-grow"
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
              />
            </div>
          ) : (
            <div className="flex h-full flex-col">
              <div className="flex flex-1 flex-shrink items-center justify-center overflow-y-auto p-4">
                <div className="w-full max-w-2xl text-center">
                  <div className="mb-8">
                    {greetingPrefix && rotatingWords.length > 0 && (
                       <h1 className="text-3xl font-semibold md:text-4xl flex justify-center items-baseline">
                         <span className="text-gradient-animated mr-2">{greetingPrefix}</span>
                         <span className="relative inline-block h-[1.2em] w-48 text-left">
                           <span className={cn('absolute w-full text-gradient-animated', animationClass)}>
                             {rotatingWords[currentWordIndex]}
                           </span>
                         </span>
                       </h1>
                    )}
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
                <p>&copy; {new Date().getFullYear()} Selene. All rights reserved.</p>
                <p>Sluiooktue Inc. Luis M.</p>
              </footer>
            </div>
          )}
        </div>
        
        {/* FNAF Monitor */}
        <FnafMonitor isOpen={isMonitorOpen} />

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
    </div>
  );
};

export default ChatLayout;


'use client';

import React, { useState, useEffect, MouseEvent } from 'react';
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import { useChatController } from '@/hooks/useChatController';
import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import LSAIGLogo from '@/components/AuraChatLogo';
import { Button } from '@/components/ui/button';
import { Save, FolderOpen, Trash2, Heart } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { cn } from '@/lib/utils';

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

const GREETING_PREFIX = "Buenos ";
const ANIMATION_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789*&%$#@!";

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
  } = useChatController();

  const [animatedGreeting, setAnimatedGreeting] = useState('');
  const [dynamicHelpText, setDynamicHelpText] = useState('');
  const { toast } = useToast();

  const [clickCount, setClickCount] = useState(0);
  const [lastClickTime, setLastClickTime] = useState(0);
  const [activeHearts, setActiveHearts] = useState<ActiveHeart[]>([]);

  useEffect(() => {
    // Greeting animation logic
    const getDynamicPartOfGreeting = () => {
      const currentHour = new Date().getHours();
      if (currentHour < 12) {
        return 'días';
      } else if (currentHour < 18) {
        return 'tardes';
      } else {
        return 'noches';
      }
    };
    const targetDynamicPart = getDynamicPartOfGreeting();

    let initialScrambledDynamicPart = "";
    for (let i = 0; i < targetDynamicPart.length; i++) {
        initialScrambledDynamicPart += ANIMATION_CHARS[Math.floor(Math.random() * ANIMATION_CHARS.length)];
    }
    setAnimatedGreeting(GREETING_PREFIX + initialScrambledDynamicPart);

    let animationProgressCount = 0;
    const revealSpeedFactor = 3; 
    let charactersRevealed = 0;
    const scrambleIntervalTime = 60; 

    const intervalId = setInterval(() => {
        if (charactersRevealed >= targetDynamicPart.length) {
            setAnimatedGreeting(GREETING_PREFIX + targetDynamicPart);
            clearInterval(intervalId);
            return;
        }

        animationProgressCount++;
        
        let currentAnimatingDynamicPart = "";
        for (let i = 0; i < targetDynamicPart.length; i++) {
            if (i < charactersRevealed) {
                currentAnimatingDynamicPart += targetDynamicPart[i];
            } else {
                currentAnimatingDynamicPart += ANIMATION_CHARS[Math.floor(Math.random() * ANIMATION_CHARS.length)];
            }
        }
        setAnimatedGreeting(GREETING_PREFIX + currentAnimatingDynamicPart);

        if (animationProgressCount % revealSpeedFactor === 0) {
            charactersRevealed++;
        }
    }, scrambleIntervalTime);

    // Dynamic help text logic
    setDynamicHelpText(helpMessages[Math.floor(Math.random() * helpMessages.length)]);
    
    return () => clearInterval(intervalId);
  }, []);


  const handlePageClick = (event: MouseEvent<HTMLDivElement>) => {
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

    if (newClickCount > CLICK_THRESHOLD) {
      const heartsToSpawn: ActiveHeart[] = [];
      for (let i = 0; i < HEARTS_PER_BURST; i++) {
        const newHeartId = `heart-${currentTime}-${Math.random()}-${i}`;
        heartsToSpawn.push({ id: newHeartId, x: event.clientX, y: event.clientY });
        
        setTimeout(() => {
          setActiveHearts(prevHearts => prevHearts.filter(h => h.id !== newHeartId));
        }, HEART_ANIMATION_DURATION_MS);
      }
      setActiveHearts(prevHearts => [...prevHearts, ...heartsToSpawn]);
      setClickCount(0);
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
        <div className="flex items-center gap-1 rounded-full bg-card p-1.5 shadow-md">
          <Button variant="ghost" size="icon" onClick={saveChat} aria-label="Save chat" className="rounded-full hover:animate-pulse-custom">
            <Save className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={loadChat} aria-label="Load chat" className="rounded-full hover:scale-110 transition-transform duration-150">
            <FolderOpen className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              clearChat();
            }}
            aria-label="Clear chat"
            className="rounded-full text-destructive hover:text-destructive hover:bg-destructive/10 hover:animate-shake"
          >
            <Trash2 className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {hasSentFirstMessage ? (
        <>
          <MessageList messages={messages} />
          <ChatInput
            currentMessage={currentInput}
            setCurrentMessage={setCurrentInput}
            onSendMessage={sendMessage}
            isCentered={false}
          />
        </>
      ) : (
        <div className="flex flex-grow flex-col justify-between">
          <div className="flex flex-grow flex-col items-center justify-center p-4">
            <div className="text-center mb-8">
              {animatedGreeting && <p className="text-4xl mt-4 font-greeting font-semibold text-gradient-animated">{animatedGreeting}</p>}
              {dynamicHelpText && <p className="text-muted-foreground mt-2">{dynamicHelpText}</p>}
            </div>
            <div className="w-full max-w-xl">
              <ChatInput
                currentMessage={currentInput}
                setCurrentMessage={setCurrentInput}
                onSendMessage={sendMessage}
                isCentered={true}
              />
            </div>
          </div>
          <footer className="text-center text-sm text-muted-foreground py-4 px-4">
            <p>&copy; {new Date().getFullYear()} LSAIG. All rights reserved.</p>
            <p>Sluiooktue Inc. Luis M.</p>
          </footer>
        </div>
      )}

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


'use client';

import React, { useState, useEffect } from 'react';
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import { useChatController } from '@/hooks/useChatController';
import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import LSAIGLogo from '@/components/AuraChatLogo';
import { Button } from '@/components/ui/button';
import { Save, FolderOpen } from 'lucide-react';
import AnimatedTrashIcon from './AnimatedTrashIcon'; // Importamos el nuevo componente

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

  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const getCurrentGreeting = () => {
      const currentHour = new Date().getHours();
      if (currentHour < 12) {
        return 'Buenos días';
      } else if (currentHour < 18) {
        return 'Buenas tardes';
      } else {
        return 'Buenas noches';
      }
    };
    setGreeting(getCurrentGreeting());
  }, []);

  return (
    <SidebarInset className="flex h-screen flex-col bg-background md:m-0 md:rounded-none md:shadow-none">
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
          <AnimatedTrashIcon onClear={clearChat} ariaLabel="Clear chat" />
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
              {greeting && <p className="text-4xl mt-4 font-greeting font-semibold text-gradient-animated">{greeting}</p>}
              <p className="text-muted-foreground mt-2">¿Cómo puedo ayudarte hoy?</p>
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
    </SidebarInset>
  );
};

export default ChatLayout;

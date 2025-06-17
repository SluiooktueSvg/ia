
'use client';

import React, { useState, useEffect } from 'react';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import { useChatController } from '@/hooks/useChatController';
import { SidebarInset } from '@/components/ui/sidebar';

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
      <ChatHeader 
        onSaveChat={saveChat}
        onLoadChat={loadChat}
        onClearChat={clearChat}
      />
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
        <div className="flex flex-grow flex-col justify-between"> {/* Container for initial screen, no padding here */}
          <div className="flex flex-grow flex-col items-center justify-center p-4"> {/* Content area with padding */}
            <div className="text-center mb-8">
              {greeting && <p className="text-4xl mt-4 font-greeting text-gradient-animated">{greeting}</p>}
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
          <footer className="text-center text-sm text-muted-foreground py-4 px-4"> {/* Footer with its own padding */}
            <p>&copy; {new Date().getFullYear()} LSAIG. All rights reserved.</p>
            <p>Sluiooktue Inc. Luis M.</p>
          </footer>
        </div>
      )}
    </SidebarInset>
    
  );
};

export default ChatLayout;

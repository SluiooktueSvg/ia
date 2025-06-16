'use client';

import React from 'react';
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
    handleInputChange, // Keep for setting currentInput
    clearChat,
    saveChat,
    loadChat,
  } = useChatController();

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
        <div className="flex flex-grow flex-col items-center justify-center p-4">
          <div className="w-full max-w-xl">
            <ChatInput
              currentMessage={currentInput}
              setCurrentMessage={setCurrentInput}
              onSendMessage={sendMessage}
              isCentered={true}
            />
          </div>
        </div>
      )}
    </SidebarInset>
  );
};

export default ChatLayout;

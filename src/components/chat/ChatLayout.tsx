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
    isLoadingCompletion,
    completionSuggestion,
    sendMessage,
    handleInputChange,
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
      <MessageList messages={messages} />
      <ChatInput
        currentMessage={currentInput}
        setCurrentMessage={setCurrentInput}
        onSendMessage={sendMessage}
        onInputChange={handleInputChange}
        isLoadingCompletion={isLoadingCompletion}
        completionSuggestion={completionSuggestion}
      />
    </SidebarInset>
  );
};

export default ChatLayout;

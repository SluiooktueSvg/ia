
import React, { useEffect, useRef } from 'react';
import type { ChatMessage } from '@/types/chat';
import MessageBubble from './MessageBubble';
import { ScrollArea } from '@/components/ui/scroll-area';

interface MessageListProps {
  messages: ChatMessage[];
  onAudioGenerated: (messageId: string, audioUrl: string) => void;
  onAudioError: (messageId: string, error: string) => void;
}

const MessageList: React.FC<MessageListProps> = ({ messages, onAudioGenerated, onAudioError }) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (viewportRef.current) {
      viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <ScrollArea className="flex-grow p-4 md:p-6" ref={scrollAreaRef} viewportRef={viewportRef} role="log" aria-live="polite">
      <div className="space-y-2">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} onAudioGenerated={onAudioGenerated} onAudioError={onAudioError} />
        ))}
      </div>
    </ScrollArea>
  );
};

export default MessageList;

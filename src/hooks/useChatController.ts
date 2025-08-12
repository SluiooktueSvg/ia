'use client';

import { useState, useEffect, useCallback } from 'react';
import type { ChatMessage } from '@/types/chat';
import { loadChatFromLocalStorage, saveChatToLocalStorage, clearChatFromLocalStorage } from '@/lib/localStorage';
import { completeMessage, MessageCompletionInput } from '@/ai/flows/message-completion';
import { analyzeSentiment, SentimentAnalysisInput } from '@/ai/flows/sentiment-analysis';
import { useToast } from "@/hooks/use-toast";

export function useChatController() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [hasSentFirstMessage, setHasSentFirstMessage] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const loadedMessages = loadChatFromLocalStorage();
    setMessages(loadedMessages);
    if (loadedMessages.length > 0) {
      setHasSentFirstMessage(true);
    }
    // Analyze sentiment for AI messages loaded from history
    loadedMessages.forEach(msg => {
      if (msg.sender === 'ai' && !msg.sentiment && !msg.sentimentLoading) {
        fetchSentimentForMessage(msg.id, msg.text);
      }
    });
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      saveChatToLocalStorage(messages);
    }
  }, [messages]);

  const handleInputChange = useCallback((text: string) => {
    setCurrentInput(text);
  }, []);

  const fetchSentimentForMessage = async (messageId: string, text: string) => {
    setMessages(prev => prev.map(m => m.id === messageId ? { ...m, sentimentLoading: true } : m));
    try {
      const sentimentInput: SentimentAnalysisInput = { text };
      const sentimentResult = await analyzeSentiment(sentimentInput);
      setMessages(prev => prev.map(m => m.id === messageId ? { ...m, sentiment: sentimentResult.sentiment, sentimentLoading: false } : m));
    } catch (error) {
      console.error('Error fetching sentiment:', error);
      setMessages(prev => prev.map(m => m.id === messageId ? { ...m, sentimentLoading: false, error: 'Failed to analyze sentiment' } : m));
      toast({
        title: "Sentiment Analysis Error",
        description: "Could not analyze message sentiment.",
        variant: "destructive",
      });
    }
  };

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    if (!hasSentFirstMessage) {
      setHasSentFirstMessage(true);
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString() + '-user',
      text,
      sender: 'user',
      timestamp: Date.now(),
    };
    
    // Create the history before setting the new state
    const historyForAI = [...messages, userMessage].map(m => ({
        sender: m.sender,
        text: m.text,
    }));

    setMessages(prev => [...prev, userMessage]);
    setCurrentInput('');

    const aiMessageId = Date.now().toString() + '-ai';
    const aiPlaceholderMessage: ChatMessage = {
      id: aiMessageId,
      text: 'Thinking...',
      sender: 'ai',
      timestamp: Date.now(),
      sentimentLoading: true,
    };
    setMessages(prev => [...prev, aiPlaceholderMessage]);

    try {
      const responseInput: MessageCompletionInput = { 
        userInputText: text,
        history: historyForAI,
       };
      const aiResponse = await completeMessage(responseInput);
      
      const refinedAiText = aiResponse.completion.trim();

      const finalAiMessage: ChatMessage = {
        ...aiPlaceholderMessage,
        text: refinedAiText || "I'm not sure how to respond to that.",
      };
      setMessages(prev => prev.map(m => m.id === aiMessageId ? finalAiMessage : m));
      fetchSentimentForMessage(aiMessageId, finalAiMessage.text);

    } catch (error) {
        console.error('Error getting AI response:', error);
        const errorAiMessage: ChatMessage = {
            ...aiPlaceholderMessage,
            text: "Sorry, I encountered an error.",
            error: "Failed to generate AI response",
            sentimentLoading: false,
        };
        setMessages(prev => prev.map(m => m.id === aiMessageId ? errorAiMessage : m));
        toast({
            title: "AI Response Error",
            description: "Could not get a response from the AI.",
            variant: "destructive",
        });
    }
  };

  const clearChat = () => {
    setMessages([]);
    clearChatFromLocalStorage();
    setHasSentFirstMessage(false); 
    toast({
        title: "Chat Cleared",
        description: "Your chat history has been cleared.",
    });
  };

  const saveChat = () => {
    saveChatToLocalStorage(messages);
    toast({
        title: "Chat Saved",
        description: "Your current chat session has been saved.",
    });
  };
  
  const loadChat = () => {
    const loadedMessages = loadChatFromLocalStorage();
    setMessages(loadedMessages);
    if (loadedMessages.length > 0) {
      setHasSentFirstMessage(true);
    } else {
      setHasSentFirstMessage(false);
    }
    loadedMessages.forEach(msg => {
      if (msg.sender === 'ai' && !msg.sentiment && !msg.sentimentLoading) {
        fetchSentimentForMessage(msg.id, msg.text);
      }
    });
    toast({
        title: "Chat Loaded",
        description: "Your previous chat session has been loaded.",
    });
  };


  return {
    messages,
    currentInput,
    setCurrentInput,
    hasSentFirstMessage,
    sendMessage,
    handleInputChange, // Keep this for setting currentInput
    clearChat,
    saveChat,
    loadChat,
  };
}

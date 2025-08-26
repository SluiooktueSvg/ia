
'use client';

import { useState, useEffect, useCallback } from 'react';
import type { ChatMessage } from '@/types/chat';
import { loadChatFromLocalStorage, saveChatToLocalStorage, clearChatFromLocalStorage, getQuotaExceededFromLocalStorage, setQuotaExceededInLocalStorage, clearQuotaExceededFromLocalStorage } from '@/lib/localStorage';
import { completeMessage, MessageCompletionInput } from '@/ai/flows/message-completion';
import { analyzeSentiment, SentimentAnalysisInput } from '@/ai/flows/sentiment-analysis';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/context/AuthContext'; // Import useAuth

export function useChatController() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [hasSentFirstMessage, setHasSentFirstMessage] = useState(false);
  const [isTtsQuotaExceeded, setIsTtsQuotaExceeded] = useState(false);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [isQuotaExceeded, setIsQuotaExceeded] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (getQuotaExceededFromLocalStorage()) {
      setIsQuotaExceeded(true);
      return;
    }

    const loadedMessages = loadChatFromLocalStorage();
    const messagesMarkedAsPlayed = loadedMessages.map(m => ({ ...m, hasPlayedAudio: true, audioUrl: m.audioUrl || undefined }));
    setMessages(messagesMarkedAsPlayed);

    if (loadedMessages.length > 0) {
      setHasSentFirstMessage(true);
    }
    loadedMessages.forEach(msg => {
      if (msg.sender === 'ai' && !msg.sentiment && !msg.sentimentLoading) {
        fetchSentimentForMessage(msg.id, msg.text);
      }
    });
  }, []);

  useEffect(() => {
    if (hasSentFirstMessage) {
      saveChatToLocalStorage(messages);
    }
  }, [messages, hasSentFirstMessage]);

  const handleInputChange = useCallback((text: string) => {
    setCurrentInput(text);
  }, []);

  const fetchSentimentForMessage = async (messageId: string, text: string) => {
    setMessages(prev => prev.map(m => m.id === messageId ? { ...m, sentimentLoading: true } : m));
    try {
      const sentimentInput: SentimentAnalysisInput = { text };
      const sentimentResult = await analyzeSentiment(sentimentInput);
      setMessages(prev => prev.map(m => m.id === messageId ? { ...m, sentiment: sentimentResult.sentiment, sentimentLoading: false } : m));
    } catch (error: any) {
      console.error('Error fetching sentiment:', error);
      const errorMessage = error.message || "Unknown error";
       if (errorMessage.includes('429') || errorMessage.toLowerCase().includes('quota')) {
        setIsQuotaExceeded(true);
        setQuotaExceededInLocalStorage();
      }
      setMessages(prev => prev.map(m => m.id === messageId ? { ...m, sentimentLoading: false } : m));
    }
  };
  
  const handleAudioGenerated = useCallback((messageId: string, audioUrl: string) => {
    setMessages(prev => prev.map(m => {
      if (m.id === messageId) {
        if (audioUrl) {
          return { ...m, audioUrl, audioLoading: false, hasPlayedAudio: true };
        } else {
          return { ...m, audioLoading: true, hasPlayedAudio: false };
        }
      }
      return m;
    }));
  }, []);
  
  const handleAudioError = useCallback((messageId: string, error: string) => {
    if (error.includes('429') || error.toLowerCase().includes('quota')) {
      setIsTtsQuotaExceeded(true);
      setMessages(prev => prev.map(m => m.id === messageId ? { ...m, audioLoading: false } : m));
      toast({
          title: "Límite de Audio Alcanzado",
          description: "¡Has alcanzado el límite de hoy! Inténtalo de nuevo mañana.",
          variant: "success",
      });
    } else {
      setMessages(prev => prev.map(m => m.id === messageId ? { ...m, audioLoading: false } : m));
      toast({
          title: "Error al Generar Audio",
          description: "No se pudo generar el audio para el mensaje.",
          variant: "destructive",
      });
    }
  }, [toast]);


  const sendMessage = async (text: string) => {
    if (!text.trim() || !user || isQuotaExceeded || isAiThinking) return;
    
    if (!hasSentFirstMessage) {
      setHasSentFirstMessage(true);
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString() + '-user',
      text,
      sender: 'user',
      timestamp: Date.now(),
      avatarUrl: user.photoURL,
    };
    
    const allMessages = [...messages, userMessage];

    const historyForAI = allMessages.map(m => ({
        isUser: m.sender === 'user',
        text: m.text,
    })).slice(0, -1); // Exclude the current user message from history for the prompt

    setMessages(allMessages);
    setCurrentInput('');
    setIsAiThinking(true);

    const aiMessageId = Date.now().toString() + '-ai';
    
    const aiPlaceholderMessage: ChatMessage = {
      id: aiMessageId,
      text: 'Thinking...',
      sender: 'ai',
      timestamp: Date.now(),
      sentimentLoading: true,
      audioLoading: false,
    };
    setMessages(prev => [...prev, aiPlaceholderMessage]);

    try {
      const sentimentResult = await analyzeSentiment({ text });
      const userSentiment = sentimentResult.sentiment;
      
      const responseInput: MessageCompletionInput = { 
        userInputText: text,
        history: historyForAI,
        userSentiment: userSentiment,
       };
      const aiResponse = await completeMessage(responseInput);

      const refinedAiText = aiResponse.completion.trim();

      const finalAiMessage: ChatMessage = {
        id: aiMessageId,
        text: refinedAiText || "I'm not sure how to respond to that.",
        sender: 'ai',
        timestamp: Date.now(),
        sentimentLoading: false,
      };
      
      setMessages(prev => prev.map(m => m.id === aiMessageId ? finalAiMessage : m));
      
      fetchSentimentForMessage(aiMessageId, finalAiMessage.text);

    } catch (error: any) {
        console.error('Error getting AI response:', error);
        const errorMessage = error.message || "Unknown error";
        
        if (errorMessage.includes('429') || errorMessage.toLowerCase().includes('quota')) {
            setIsQuotaExceeded(true);
            setQuotaExceededInLocalStorage();
        } else {
             toast({
                title: "AI Response Error",
                description: "Could not get a response from the AI.",
                variant: "destructive",
            });
        }
        // Remove the placeholder message on any error
        setMessages(prev => prev.filter(m => m.id !== aiMessageId));

    } finally {
        setIsAiThinking(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    clearChatFromLocalStorage();
    clearQuotaExceededFromLocalStorage();
    setHasSentFirstMessage(false);
    setIsTtsQuotaExceeded(false);
    setIsQuotaExceeded(false);
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
    if (getQuotaExceededFromLocalStorage()) {
      setIsQuotaExceeded(true);
      return;
    }

    const loadedMessages = loadChatFromLocalStorage();
    const messagesMarkedAsPlayed = loadedMessages.map(m => ({ ...m, hasPlayedAudio: true, audioUrl: m.audioUrl || undefined }));
    setMessages(messagesMarkedAsPlayed);
    setIsTtsQuotaExceeded(false);

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
    isTtsQuotaExceeded,
    setIsTtsQuotaExceeded,
    isAiThinking,
    isQuotaExceeded,
    sendMessage,
    handleInputChange,
    clearChat,
    saveChat,
    loadChat,
    handleAudioGenerated,
    handleAudioError,
  };
}

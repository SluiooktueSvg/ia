'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { ChatMessage } from '@/types/chat';
import { loadChatFromLocalStorage, saveChatToLocalStorage, clearChatFromLocalStorage } from '@/lib/localStorage';
import { completeMessage, MessageCompletionInput } from '@/ai/flows/message-completion';
import { analyzeSentiment, SentimentAnalysisInput } from '@/ai/flows/sentiment-analysis';
import { useToast } from "@/hooks/use-toast";

const DEBOUNCE_DELAY = 500; // milliseconds for autocomplete debounce

export function useChatController() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [isLoadingCompletion, setIsLoadingCompletion] = useState(false);
  const [completionSuggestion, setCompletionSuggestion] = useState<string | null>(null);
  const [hasSentFirstMessage, setHasSentFirstMessage] = useState(false);
  const { toast } = useToast();
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    if (text.trim().length > 2) { // Only fetch completion if there's enough text
      debounceTimeoutRef.current = setTimeout(async () => {
        setIsLoadingCompletion(true);
        try {
          const suggestionInput: MessageCompletionInput = { userInputText: text, isSuggestion: true };
          const result = await completeMessage(suggestionInput);
          if (result.completion && result.completion !== text) {
            setCompletionSuggestion(result.completion);
          } else {
            setCompletionSuggestion(null);
          }
        } catch (error) {
          console.error('Error fetching message completion:', error);
          setCompletionSuggestion(null);
          // Do not toast for autocomplete errors to avoid being too noisy
        } finally {
          setIsLoadingCompletion(false);
        }
      }, DEBOUNCE_DELAY);
    } else {
      setCompletionSuggestion(null); // Clear suggestion if input is short
    }
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
    setMessages(prev => [...prev, userMessage]);
    setCurrentInput('');
    setCompletionSuggestion(null);

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
      const responseInput: MessageCompletionInput = { userInputText: text, isSuggestion: false };
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
    isLoadingCompletion,
    completionSuggestion,
    hasSentFirstMessage, // Expose new state
    sendMessage,
    handleInputChange,
    clearChat,
    saveChat,
    loadChat,
  };
}

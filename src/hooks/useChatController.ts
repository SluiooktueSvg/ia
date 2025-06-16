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
  const { toast } = useToast();
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const loadedMessages = loadChatFromLocalStorage();
    setMessages(loadedMessages);
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
          const input: MessageCompletionInput = { messageFragment: text };
          const result = await completeMessage(input);
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

    const userMessage: ChatMessage = {
      id: Date.now().toString() + '-user',
      text,
      sender: 'user',
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, userMessage]);
    setCurrentInput('');
    setCompletionSuggestion(null);

    // Simulate AI response and sentiment analysis
    // In a real app, this would be an API call to an AI model
    const aiMessageId = Date.now().toString() + '-ai';
    const aiPlaceholderMessage: ChatMessage = {
      id: aiMessageId,
      text: 'Thinking...',
      sender: 'ai',
      timestamp: Date.now(),
      sentimentLoading: true,
    };
    setMessages(prev => [...prev, aiPlaceholderMessage]);

    // For demonstration, let's use the completeMessage for AI response.
    // Replace with your actual AI logic for chat response.
    try {
      const responseInput: MessageCompletionInput = { messageFragment: `User: ${text}\nAI:` };
      const aiResponse = await completeMessage(responseInput); // This is a placeholder for actual chat response generation
      
      const refinedAiText = aiResponse.completion.startsWith(`User: ${text}\nAI:`) 
        ? aiResponse.completion.substring(`User: ${text}\nAI:`.length).trim()
        : aiResponse.completion;

      const finalAiMessage: ChatMessage = {
        ...aiPlaceholderMessage,
        text: refinedAiText || "I'm not sure how to respond to that.", // Fallback response
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
    setCurrentInput, // Expose for ChatInput to directly manage its state
    isLoadingCompletion,
    completionSuggestion,
    sendMessage,
    handleInputChange, // Expose for ChatInput
    clearChat,
    saveChat,
    loadChat,
  };
}

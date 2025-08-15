
'use client';

import { useState, useEffect, useCallback, Dispatch, SetStateAction } from 'react';
import type { ChatMessage } from '@/types/chat';
import { loadChatFromLocalStorage, saveChatToLocalStorage, clearChatFromLocalStorage } from '@/lib/localStorage';
import { completeMessage, MessageCompletionInput } from '@/ai/flows/message-completion';
import { analyzeSentiment, SentimentAnalysisInput } from '@/ai/flows/sentiment-analysis';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/context/AuthContext'; // Import useAuth

export function useChatController() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [hasSentFirstMessage, setHasSentFirstMessage] = useState(false);
  const [isTtsQuotaExceeded, setIsTtsQuotaExceeded] = useState(false);
  const [isCodeMode, setIsCodeMode] = useState(false);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth(); // Get user from auth context

  useEffect(() => {
    const loadedMessages = loadChatFromLocalStorage();
    // Mark all loaded messages as played to prevent autoplay on load
    const messagesMarkedAsPlayed = loadedMessages.map(m => ({ ...m, hasPlayedAudio: true, audioUrl: m.audioUrl || undefined }));
    setMessages(messagesMarkedAsPlayed);

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
    if (hasSentFirstMessage) { // Only save if a message has been sent
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
    } catch (error) {
      console.error('Error fetching sentiment:', error);
      setMessages(prev => prev.map(m => m.id === messageId ? { ...m, sentimentLoading: false } : m));
      toast({
        title: "Sentiment Analysis Error",
        description: "Could not analyze message sentiment.",
        variant: "destructive",
      });
    }
  };
  
  const handleAudioGenerated = useCallback((messageId: string, audioUrl: string) => {
    setMessages(prev => prev.map(m => {
      if (m.id === messageId) {
        // If an audioUrl is provided, it means generation was successful or we're just updating state.
        // If audioUrl is empty string, it's a signal to start loading.
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
    // Check for quota error and set global state
    if (error.includes('429') || error.toLowerCase().includes('quota')) {
      setIsTtsQuotaExceeded(true);
      setMessages(prev => prev.map(m => m.id === messageId ? { ...m, audioLoading: false } : m));
      // Use the default toast for quota issues, making it less alarming
      toast({
          title: "Límite de Audio Alcanzado",
          description: "¡Has alcanzado el límite de hoy! Inténtalo de nuevo mañana.",
          variant: "success",
      });
    } else {
      // Handle other potential errors during audio generation
      setMessages(prev => prev.map(m => m.id === messageId ? { ...m, audioLoading: false } : m));
      toast({
          title: "Error al Generar Audio",
          description: "No se pudo generar el audio para el mensaje.",
          variant: "destructive",
      });
    }
  }, [toast]);


  const sendMessage = async (text: string) => {
    if (!text.trim() || !user) return;

    // --- Client-side command handling for Code Mode ---
    if (isCodeMode) {
      const command = text.trim().toLowerCase();
      if (command === 'cls' || command === 'clear') {
        setMessages([]); // Clear messages in the view
        setCurrentInput(''); // Clear the input field
        return; // Stop execution, don't send to AI
      }
      // Add other commands here with `else if`
    }
    
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
    
    // Create the history for the AI call
    const historyForAI = [...messages, userMessage].map(m => ({
        isUser: m.sender === 'user',
        text: m.text,
    }));

    // Add user message to state immediately for a responsive UI
    setMessages(prev => [...prev, userMessage]);
    setCurrentInput('');
    setIsAiThinking(true);

    const aiMessageId = Date.now().toString() + '-ai';
    
    // In standard UI, add a placeholder. In code mode, the thinking indicator is handled separately.
    if (!isCodeMode) {
      const aiPlaceholderMessage: ChatMessage = {
        id: aiMessageId,
        text: 'Thinking...',
        sender: 'ai',
        timestamp: Date.now(),
        sentimentLoading: true,
        audioLoading: false,
      };
      setMessages(prev => [...prev, aiPlaceholderMessage]);
    }


    try {
      // Analyze sentiment of the user's message before sending to completion
      const sentimentResult = await analyzeSentiment({ text });
      const userSentiment = sentimentResult.sentiment;
      
      const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      const responseInput: MessageCompletionInput = { 
        userInputText: text,
        history: historyForAI.slice(0, -1), // Send history *excluding* the latest user message which is the main input
        userSentiment: userSentiment, // Pass the analyzed sentiment
        isCodeMode: isCodeMode, // Pass the code mode state to the AI
        timezone: userTimezone, // Pass the user's timezone
       };
      const aiResponse = await completeMessage(responseInput);
      
      if (aiResponse.containsCode && !isCodeMode) {
        setIsCodeMode(true);
      }

      const refinedAiText = aiResponse.completion.trim();

      const finalAiMessage: ChatMessage = {
        id: aiMessageId,
        text: refinedAiText || "I'm not sure how to respond to that.",
        sender: 'ai',
        timestamp: Date.now(),
        sentimentLoading: false,
      };
      
      if(isCodeMode) {
        setMessages(prev => [...prev, finalAiMessage]);
      } else {
        setMessages(prev => prev.map(m => m.id === aiMessageId ? finalAiMessage : m));
      }
      
      // Fetch sentiment only for non-code mode for now
      if (!isCodeMode) {
        fetchSentimentForMessage(aiMessageId, finalAiMessage.text);
      }

    } catch (error) {
        console.error('Error getting AI response:', error);
        const errorAiMessage: ChatMessage = {
            id: aiMessageId,
            text: "Sorry, I encountered an error.",
            sender: 'ai',
            timestamp: Date.now(),
            sentimentLoading: false,
            audioLoading: false,
        };
        if(isCodeMode) {
            setMessages(prev => [...prev, errorAiMessage]);
        } else {
            setMessages(prev => prev.map(m => m.id === aiMessageId ? errorAiMessage : m));
        }
        toast({
            title: "AI Response Error",
            description: "Could not get a response from the AI.",
            variant: "destructive",
        });
    } finally {
        setIsAiThinking(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    clearChatFromLocalStorage();
    setHasSentFirstMessage(false);
    setIsTtsQuotaExceeded(false); // Reset quota state on clear
    setIsCodeMode(false); // Also exit code mode
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
    const messagesMarkedAsPlayed = loadedMessages.map(m => ({ ...m, hasPlayedAudio: true, audioUrl: m.audioUrl || undefined }));
    setMessages(messagesMarkedAsPlayed);
    setIsTtsQuotaExceeded(false); // Reset quota state on load

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
    isCodeMode,
    setIsCodeMode,
    isAiThinking,
    sendMessage,
    handleInputChange, // Keep this for setting currentInput
    clearChat,
    saveChat,
    loadChat,
    handleAudioGenerated,
    handleAudioError,
  };
}


'use client';

import { useState, useEffect, useCallback } from 'react';
import type { ChatMessage } from '@/types/chat';
import { loadChatFromLocalStorage, saveChatToLocalStorage, clearChatFromLocalStorage } from '@/lib/localStorage';
import { completeMessage, MessageCompletionInput } from '@/ai/flows/message-completion';
import { analyzeSentiment, SentimentAnalysisInput } from '@/ai/flows/sentiment-analysis';
import { textToSpeech } from '@/ai/flows/text-to-speech';
import { useToast } from "@/hooks/use-toast";

export function useChatController() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [hasSentFirstMessage, setHasSentFirstMessage] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const loadedMessages = loadChatFromLocalStorage();
    // Mark all loaded messages as played to prevent autoplay on load
    const messagesMarkedAsPlayed = loadedMessages.map(m => ({ ...m, hasPlayedAudio: true }));
    setMessages(messagesMarkedAsPlayed);

    if (loadedMessages.length > 0) {
      setHasSentFirstMessage(true);
    }
    // Analyze sentiment for AI messages loaded from history
    loadedMessages.forEach(msg => {
      if (msg.sender === 'ai' && !msg.sentiment && !msg.sentimentLoading) {
        fetchSentimentForMessage(msg.id, msg.text);
      }
      if (msg.sender === 'ai' && msg.text && !msg.audioUrl && !msg.audioLoading) {
        fetchAudioForMessage(msg.id, msg.text);
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
      setMessages(prev => prev.map(m => m.id === messageId ? { ...m, sentimentLoading: false, error: 'Failed to analyze sentiment' } : m));
      toast({
        title: "Sentiment Analysis Error",
        description: "Could not analyze message sentiment.",
        variant: "destructive",
      });
    }
  };
  
  const fetchAudioForMessage = async (messageId: string, text: string) => {
    setMessages(prev => prev.map(m => m.id === messageId ? { ...m, audioLoading: true } : m));
    try {
      const { audioUrl } = await textToSpeech(text);
      setMessages(prev => prev.map(m => m.id === messageId ? { ...m, audioUrl, audioLoading: false, hasPlayedAudio: false } : m));
    } catch (error) {
      console.error('Error fetching audio:', error);
      setMessages(prev => prev.map(m => m.id === messageId ? { ...m, audioLoading: false, error: (m.error ? m.error + '; ' : '') + 'Failed to generate audio' } : m));
      toast({
        title: "Audio Generation Error",
        description: "Could not generate audio for the message.",
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
    
    // Add user message to state immediately for a responsive UI
    setMessages(prev => [...prev, userMessage]);
    setCurrentInput('');

    // Prepare data for the AI call *after* updating the state
    const messagesForAI = [...messages, userMessage];

    // Create the history for the AI call
    const historyForAI = messagesForAI.map(m => ({
        isUser: m.sender === 'user',
        text: m.text,
    }));

    const aiMessageId = Date.now().toString() + '-ai';
    const aiPlaceholderMessage: ChatMessage = {
      id: aiMessageId,
      text: 'Thinking...',
      sender: 'ai',
      timestamp: Date.now(),
      sentimentLoading: true,
      audioLoading: true,
    };
    setMessages(prev => [...prev, aiPlaceholderMessage]);

    try {
      const responseInput: MessageCompletionInput = { 
        userInputText: text,
        history: historyForAI.slice(0, -1), // Send history *excluding* the latest user message which is the main input
       };
      const aiResponse = await completeMessage(responseInput);
      
      const refinedAiText = aiResponse.completion.trim();

      const finalAiMessage: ChatMessage = {
        ...aiPlaceholderMessage,
        text: refinedAiText || "I'm not sure how to respond to that.",
        sentimentLoading: false, // Initial state, sentiment will be fetched next
        audioLoading: true, // Audio is not yet loaded
      };
      setMessages(prev => prev.map(m => m.id === aiMessageId ? finalAiMessage : m));
      
      // Fetch sentiment and audio in parallel
      fetchSentimentForMessage(aiMessageId, finalAiMessage.text);
      fetchAudioForMessage(aiMessageId, finalAiMessage.text);


    } catch (error) {
        console.error('Error getting AI response:', error);
        const errorAiMessage: ChatMessage = {
            ...aiPlaceholderMessage,
            text: "Sorry, I encountered an error.",
            error: "Failed to generate AI response",
            sentimentLoading: false,
            audioLoading: false,
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
    const messagesMarkedAsPlayed = loadedMessages.map(m => ({ ...m, hasPlayedAudio: true }));
    setMessages(messagesMarkedAsPlayed);

    if (loadedMessages.length > 0) {
      setHasSentFirstMessage(true);
    } else {
      setHasSentFirstMessage(false);
    }
    loadedMessages.forEach(msg => {
      if (msg.sender === 'ai' && !msg.sentiment && !msg.sentimentLoading) {
        fetchSentimentForMessage(msg.id, msg.text);
      }
      if (msg.sender === 'ai' && msg.text && !msg.audioUrl && !msg.audioLoading) {
        fetchAudioForMessage(msg.id, msg.text);
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

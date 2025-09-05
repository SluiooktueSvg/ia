
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { completeMessage } from '@/ai/flows/message-completion';
import { textToSpeech } from '@/ai/flows/text-to-speech';
import { analyzeSentiment } from '@/ai/flows/sentiment-analysis';
import type { ChatMessage } from '@/types/chat';

type VoiceStatus = 'idle' | 'listening' | 'processing' | 'speaking';

export function useVoiceController() {
  const [status, setStatus] = useState<VoiceStatus>('idle');
  const [transcript, setTranscript] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [history, setHistory] = useState<ChatMessage[]>([]);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const processAndRespond = useCallback(async (text: string) => {
    if (!text.trim()) {
        setStatus('idle');
        return;
    }
    
    setStatus('processing');
    setTranscript('');
    
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      text,
      sender: 'user',
      timestamp: Date.now(),
    };

    try {
      // Analyze sentiment of the user's text
      const sentimentResult = await analyzeSentiment({ text });
      const userSentiment = sentimentResult.sentiment;

      const historyForAI = [...history, userMessage].map(m => ({
          isUser: m.sender === 'user',
          text: m.text,
      }));

      const response = await completeMessage({
        userInputText: text,
        history: historyForAI, // Corrected: Send the full history including the new message
        userSentiment: userSentiment, // Pass sentiment to the message completion flow
      });

      const aiText = response.completion.trim();
      setAiResponse(aiText);
      setStatus('speaking');

      const { audioUrl } = await textToSpeech(aiText);
      
      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        text: aiText,
        sender: 'ai',
        timestamp: Date.now(),
        audioUrl: audioUrl,
      };

      setHistory(prev => [...prev, userMessage, aiMessage]);

      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.play().catch(e => console.error("Audio playback failed", e));
        audioRef.current.onended = () => {
          setStatus('idle');
          setAiResponse('');
        };
      }
    } catch (error) {
      console.error("Error processing response:", error);
      setAiResponse("Lo siento, ocurrió un error.");
      setStatus('speaking'); // To say the error message
      
      // A fallback TTS for the error could be added here if needed
      setTimeout(() => {
        setStatus('idle');
        setAiResponse('');
      }, 2000);
    }
  }, [history]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
    }
  }, []);

  const startListening = useCallback(() => {
    if (status !== 'idle') return;

    if (!recognitionRef.current) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        alert("Tu navegador no soporta el reconocimiento de voz.");
        return;
      }
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'es-ES';

      recognitionRef.current.onresult = (event) => {
        if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);

        let finalTranscript = '';
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        setTranscript(interimTranscript);

        if (finalTranscript.trim()) {
            stopListening();
            processAndRespond(finalTranscript);
        } else {
             // Reset silence timer
            silenceTimeoutRef.current = setTimeout(() => {
                stopListening();
                // If there's interim transcript, process it.
                if (interimTranscript.trim()) {
                    processAndRespond(interimTranscript);
                } else {
                    setStatus('idle');
                }
            }, 2000); // Stop after 2 seconds of silence
        }
      };

      recognitionRef.current.onend = () => {
        // This can be triggered by .stop() or by the browser.
        // We only transition to idle if we are not already processing.
        if (status === 'listening') {
            setStatus('idle');
        }
      };
      
      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        setStatus('idle');
      }
    }

    try {
      recognitionRef.current.start();
      setStatus('listening');
    } catch(e) {
      console.error("Could not start recognition service: ", e);
      setStatus('idle');
    }
  }, [status, processAndRespond, stopListening]);


  return {
    status,
    transcript,
    aiResponse,
    startListening,
    audioRef,
  };
}

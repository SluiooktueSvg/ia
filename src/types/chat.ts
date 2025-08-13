export type Sender = 'user' | 'ai';

export interface ChatMessage {
  id: string;
  text: string;
  sender: Sender;
  timestamp: number;
  sentiment?: string;
  sentimentLoading?: boolean;
  error?: string;
  audioUrl?: string;
  audioLoading?: boolean;
}

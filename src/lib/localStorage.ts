import type { ChatMessage } from '@/types/chat';

const CHAT_STORAGE_KEY = 'lsaigChatSession';

export const saveChatToLocalStorage = (messages: ChatMessage[]): void => {
  try {
    const serializedMessages = JSON.stringify(messages);
    localStorage.setItem(CHAT_STORAGE_KEY, serializedMessages);
  } catch (error) {
    console.error("Failed to save chat to local storage:", error);
  }
};

export const loadChatFromLocalStorage = (): ChatMessage[] => {
  try {
    const serializedMessages = localStorage.getItem(CHAT_STORAGE_KEY);
    if (serializedMessages === null) {
      return [];
    }
    return JSON.parse(serializedMessages);
  } catch (error) {
    console.error("Failed to load chat from local storage:", error);
    return [];
  }
};

export const clearChatFromLocalStorage = (): void => {
  try {
    localStorage.removeItem(CHAT_STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear chat from local storage:", error);
  }
};

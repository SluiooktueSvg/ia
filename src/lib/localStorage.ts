
import type { ChatMessage } from '@/types/chat';

const CHAT_STORAGE_KEY = 'seleneChatSession';
const QUOTA_EXCEEDED_KEY = 'seleneQuotaExceeded';

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

// Functions for managing the quota exceeded flag

export const setQuotaExceededInLocalStorage = (): void => {
  try {
    localStorage.setItem(QUOTA_EXCEEDED_KEY, 'true');
  } catch (error) {
    console.error("Failed to set quota exceeded flag in local storage:", error);
  }
};

export const getQuotaExceededFromLocalStorage = (): boolean => {
  try {
    const quotaExceeded = localStorage.getItem(QUOTA_EXCEEDED_KEY);
    return quotaExceeded === 'true';
  } catch (error) {
    console.error("Failed to get quota exceeded flag from local storage:", error);
    return false;
  }
};

export const clearQuotaExceededFromLocalStorage = (): void => {
  try {
    localStorage.removeItem(QUOTA_EXCEEDED_KEY);
  } catch (error) {
    console.error("Failed to clear quota exceeded flag from local storage:", error);
  }
};

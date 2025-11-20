import { useState, useCallback } from 'react';
import { sendChatMessage, getChatWelcome } from '../services/api';
import { ChatRequest, ChatResponse, ChatMessage } from '../types/api';
import { handleApiError, logError } from '../utils/errorHandler';

interface UseChatReturn {
  sendMessage: (message: string) => Promise<ChatResponse>;
  initChat: () => Promise<ChatResponse>;
  messages: ChatMessage[];
  sessionId: string | null;
  loading: boolean;
  error: string | null;
  reset: () => void;
  quickReplies: string[];
}

/**
 * Hook for managing chat conversations
 */
export const useChat = (userType: string = 'شركة عمرة'): UseChatReturn => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quickReplies, setQuickReplies] = useState<string[]>([]);

  const sendMessage = useCallback(
    async (message: string): Promise<ChatResponse> => {
      setLoading(true);
      setError(null);

      try {
        // Add user message to local state
        setMessages((prev) => [
          ...prev,
          {
            role: 'user',
            content: message,
            timestamp: new Date(),
          },
        ]);

        // Send to API
        const response = await sendChatMessage({
          message,
          user_type: userType,
          session_id: sessionId || undefined,
        });

        // Update session ID
        if (response.session_id) {
          setSessionId(response.session_id);
        }

        // Add bot message to local state
        setMessages((prev) => [
          ...prev,
          {
            role: 'bot',
            content: response.response,
            timestamp: new Date(),
          },
        ]);

        // Update quick replies
        setQuickReplies(response.quick_replies || []);

        return response;
      } catch (err) {
        const apiError = handleApiError(err);
        const errorMessage = apiError.message || 'Failed to send message';
        setError(errorMessage);
        logError(err, 'useChat.sendMessage');
        throw apiError;
      } finally {
        setLoading(false);
      }
    },
    [sessionId, userType]
  );

  const initChat = useCallback(async (): Promise<ChatResponse> => {
    setLoading(true);
    setError(null);
    setMessages([]);

    try {
      const response = await getChatWelcome(userType);

      if (response.session_id) {
        setSessionId(response.session_id);
      }

      // Add welcome message
      setMessages([
        {
          role: 'bot',
          content: response.response,
          timestamp: new Date(),
        },
      ]);

      setQuickReplies(response.quick_replies || []);

      return response;
    } catch (err) {
      const apiError = handleApiError(err);
      const errorMessage = apiError.message || 'Failed to initialize chat';
      setError(errorMessage);
      logError(err, 'useChat.initChat');
      throw apiError;
    } finally {
      setLoading(false);
    }
  }, [userType]);

  const reset = useCallback(() => {
    setMessages([]);
    setSessionId(null);
    setLoading(false);
    setError(null);
    setQuickReplies([]);
  }, []);

  return {
    sendMessage,
    initChat,
    messages,
    sessionId,
    loading,
    error,
    reset,
    quickReplies,
  };
};

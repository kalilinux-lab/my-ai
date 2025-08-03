import { useState, useEffect, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import type { Message, ChatResponse, Settings } from '@/types/chat';

interface UseChatOptions {
  sessionId?: string;
  autoScroll?: boolean;
}

export function useChat(options: UseChatOptions = {}) {
  const [sessionId] = useState(options.sessionId || crypto.randomUUID());
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load conversation history
  const { data: conversationData } = useQuery({
    queryKey: ['/api/conversation', sessionId],
    enabled: !!sessionId,
  });

  // Load settings
  const { data: settingsData } = useQuery<{ settings: Settings }>({
    queryKey: ['/api/settings'],
  });

  useEffect(() => {
    if (conversationData?.messages) {
      setMessages(conversationData.messages);
    }
  }, [conversationData]);

  // Auto scroll to bottom
  useEffect(() => {
    if (options.autoScroll !== false && settingsData?.settings?.autoScroll === 'true') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, options.autoScroll, settingsData?.settings?.autoScroll]);

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (message: string): Promise<ChatResponse> => {
      const response = await apiRequest('POST', '/api/chat', {
        message,
        sessionId,
      });
      return response.json();
    },
    onMutate: (message: string) => {
      // Add user message immediately
      const userMessage: Message = {
        role: 'user',
        content: message,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, userMessage]);
      setIsTyping(true);
    },
    onSuccess: (data: ChatResponse) => {
      // Add AI response
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response,
        timestamp: data.timestamp,
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
      
      // Invalidate conversation cache
      queryClient.invalidateQueries({ queryKey: ['/api/conversation', sessionId] });
    },
    onError: (error) => {
      setIsTyping(false);
      console.error('Error sending message:', error);
      
      // Add error message
      const errorMessage: Message = {
        role: 'assistant',
        content: 'I apologize, but I encountered an error processing your request. Please try again.',
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
    },
  });

  // Quick action mutation
  const quickActionMutation = useMutation({
    mutationFn: async (action: string): Promise<ChatResponse> => {
      const response = await apiRequest('POST', '/api/quick-action', {
        action,
        sessionId,
      });
      return response.json();
    },
    onMutate: (action: string) => {
      const userMessage: Message = {
        role: 'user',
        content: action,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, userMessage]);
      setIsTyping(true);
    },
    onSuccess: (data: ChatResponse) => {
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response,
        timestamp: data.timestamp,
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
      
      queryClient.invalidateQueries({ queryKey: ['/api/conversation', sessionId] });
    },
    onError: (error) => {
      setIsTyping(false);
      console.error('Error with quick action:', error);
      
      const errorMessage: Message = {
        role: 'assistant',
        content: 'I encountered an error processing that action. Please try again.',
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
    },
  });

  const sendMessage = (message: string) => {
    if (message.trim() && !sendMessageMutation.isPending) {
      sendMessageMutation.mutate(message.trim());
    }
  };

  const sendQuickAction = (action: string) => {
    if (action.trim() && !quickActionMutation.isPending) {
      quickActionMutation.mutate(action.trim());
    }
  };

  return {
    messages,
    isTyping,
    sessionId,
    sendMessage,
    sendQuickAction,
    isLoading: sendMessageMutation.isPending || quickActionMutation.isPending,
    error: sendMessageMutation.error || quickActionMutation.error,
    messagesEndRef,
    settings: settingsData?.settings,
  };
}

import { Message } from '@/types/chat';
import { Bot, User } from 'lucide-react';

interface ChatMessageProps {
  message: Message;
  showTimestamp?: boolean;
  compact?: boolean;
}

export function ChatMessage({ message, showTimestamp = true, compact = false }: ChatMessageProps) {
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (message.role === 'user') {
    return (
      <div className="flex justify-end animate-slide-up">
        <div className="bg-jarvis-primary text-jarvis-dark rounded-lg p-4 max-w-xs lg:max-w-md">
          <p className="font-medium">{message.content}</p>
          {showTimestamp && (
            <span className="text-xs opacity-75 mt-2 block">
              {formatTime(message.timestamp)}
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start animate-slide-up">
      <div className="bg-jarvis-surface border border-jarvis-surface-light rounded-lg p-4 max-w-xs lg:max-w-md">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 bg-jarvis-primary rounded-full flex items-center justify-center flex-shrink-0">
            <Bot className="w-4 h-4 text-jarvis-dark" />
          </div>
          <div className="flex-1">
            <div className="text-gray-100 whitespace-pre-wrap">
              {message.content}
            </div>
            {showTimestamp && (
              <span className="text-xs text-gray-400 mt-2 block">
                {formatTime(message.timestamp)}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="bg-jarvis-surface border border-jarvis-surface-light rounded-lg p-4 max-w-xs">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-jarvis-primary rounded-full flex items-center justify-center">
            <Bot className="w-4 h-4 text-jarvis-dark" />
          </div>
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-jarvis-primary rounded-full animate-typing"></div>
            <div className="w-2 h-2 bg-jarvis-primary rounded-full animate-typing" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-jarvis-primary rounded-full animate-typing" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}

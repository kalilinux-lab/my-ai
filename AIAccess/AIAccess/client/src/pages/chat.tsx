import { useState, useRef, KeyboardEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Bot, Settings, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ChatMessage, TypingIndicator } from '@/components/ChatMessage';
import { QuickActions } from '@/components/QuickActions';
import { SettingsModal } from '@/components/SettingsModal';
import { ErrorModal } from '@/components/ErrorModal';
import { useChat } from '@/hooks/useChat';

export default function Chat() {
  const [messageInput, setMessageInput] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { 
    messages, 
    isTyping, 
    sendMessage, 
    sendQuickAction, 
    isLoading, 
    error,
    messagesEndRef,
    settings 
  } = useChat();

  // Health check query
  const { data: healthData, isError: healthError } = useQuery({
    queryKey: ['/api/health'],
    refetchInterval: 30000, // Check every 30 seconds
  });

  const handleSendMessage = () => {
    if (messageInput.trim() && !isLoading) {
      sendMessage(messageInput);
      setMessageInput('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessageInput(e.target.value);
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  };

  const handleQuickAction = (command: string) => {
    sendQuickAction(command);
  };

  // Show error modal if there's an error
  if (error && !showError) {
    setErrorMessage(error.message || 'An unexpected error occurred');
    setShowError(true);
  }

  const connectionStatus = healthError ? 'Offline' : 'Online';
  const isConnected = !healthError;

  return (
    <div className="min-h-screen bg-jarvis-dark flex flex-col relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-jarvis-primary opacity-5 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-jarvis-accent opacity-5 rounded-full blur-3xl animate-float" style={{animationDelay: '1s'}}></div>
      </div>

      {/* Header */}
      <header className="glass-panel relative z-10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Bot className="text-jarvis-primary w-10 h-10 animate-pulse-glow" />
            <div className="absolute -inset-2 bg-jarvis-primary opacity-20 rounded-full animate-ping"></div>
          </div>
          <div>
            <h1 className="jarvis-title text-2xl font-bold">J.A.R.V.I.S</h1>
            <p className="text-sm text-jarvis-primary font-medium">Just A Rather Very Intelligent System</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 glass-button px-3 py-2 rounded-lg">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-jarvis-success' : 'bg-jarvis-error'} animate-pulse glow-primary`} />
            <span className="text-sm font-medium text-white">{connectionStatus}</span>
          </div>
          <a href="/about" className="glass-button hover-glow border-jarvis-primary/30 text-jarvis-primary px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300">
            About
          </a>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowSettings(true)}
            className="glass-button hover-glow border-jarvis-primary/30 text-jarvis-primary"
          >
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Main Chat Area */}
      <main className="flex-1 flex overflow-hidden">
        
        {/* Quick Actions Sidebar */}
        <QuickActions onAction={handleQuickAction} disabled={isLoading} />

        {/* Chat Container */}
        <div className="flex-1 flex flex-col relative z-10">
          
          {/* Message Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* Welcome Message */}
            {messages.length === 0 && (
              <div className="flex justify-center animate-slide-up">
                <div className="glass-panel p-8 max-w-2xl text-center glow-primary">
                  <div className="relative mb-6">
                    <div className="w-20 h-20 bg-jarvis-gradient rounded-full flex items-center justify-center mx-auto glow-strong animate-float">
                      <Bot className="w-10 h-10 text-white" />
                    </div>
                    <div className="absolute -inset-4 bg-jarvis-primary opacity-20 rounded-full animate-ping"></div>
                  </div>
                  <h2 className="jarvis-title text-3xl font-bold mb-3">Welcome to J.A.R.V.I.S</h2>
                  <p className="text-lg text-jarvis-primary mb-4 font-medium">Just A Rather Very Intelligent System</p>
                  <p className="text-gray-300 leading-relaxed">Your advanced AI assistant with unlimited capabilities. I can help with calculations, answer questions, provide analysis, tell jokes, and much more. I also feature self-correction technology to ensure accurate responses.</p>
                  <div className="mt-6 flex justify-center gap-2">
                    <div className="w-2 h-2 bg-jarvis-primary rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-jarvis-accent rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                    <div className="w-2 h-2 bg-jarvis-primary rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                  </div>
                </div>
              </div>
            )}

            {/* Messages */}
            {messages.map((message, index) => (
              <ChatMessage 
                key={index} 
                message={message} 
                showTimestamp={settings?.showTimestamps === 'true'}
                compact={settings?.compactMode === 'true'}
              />
            ))}

            {/* Typing Indicator */}
            {isTyping && <TypingIndicator />}
            
            {/* Scroll anchor */}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-6 glass-panel border-t border-jarvis-primary/20">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-end gap-4">
                <div className="flex-1 relative">
                  <Textarea
                    ref={textareaRef}
                    value={messageInput}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask J.A.R.V.I.S anything... (Press Enter to send, Shift+Enter for new line)"
                    className="min-h-[56px] max-h-[120px] resize-none glass-button text-white placeholder:text-jarvis-primary/60 focus:border-jarvis-primary focus:glow-primary text-lg leading-relaxed"
                    disabled={isLoading}
                  />
                  <div className="absolute bottom-2 right-2 text-xs text-jarvis-primary/40">
                    {messageInput.length}/2000
                  </div>
                </div>
                <Button
                  type="submit"
                  size="lg"
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim() || isLoading}
                  className="glass-button bg-jarvis-gradient hover-glow text-white font-semibold px-8 py-4 text-lg transition-all duration-300"
                >
                  {isLoading ? (
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </Button>
              </div>
              <div className="mt-3 text-center">
                <p className="text-xs text-jarvis-primary/60">
                  Powered by Google Gemini AI • Self-correcting technology • Unlimited usage
                </p>
              </div>
            </div>
          </div>
        </div>
        
      </main>
      
      {/* Settings Modal */}
      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
      
      {/* Error Modal */}
      <ErrorModal 
        isOpen={showError} 
        onClose={() => setShowError(false)} 
        error={errorMessage}
        onRetry={() => {
          if (messageInput.trim()) {
            handleSendMessage();
          }
        }}
      />
    </div>
  );
}

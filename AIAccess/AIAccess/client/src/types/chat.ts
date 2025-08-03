export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface ChatResponse {
  response: string;
  sessionId: string;
  timestamp: string;
}

export interface Settings {
  id: string;
  userId: string;
  openRouterApiKey: string | null;
  wolframAppId: string | null;
  selectedModel: string;
  autoScroll: string;
  showTimestamps: string;
  compactMode: string;
}

export interface QuickAction {
  icon: string;
  text: string;
  command: string;
}

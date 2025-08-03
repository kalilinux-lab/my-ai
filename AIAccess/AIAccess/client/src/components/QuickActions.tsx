import { Calculator, Clock, Globe, HelpCircle, Laugh, Newspaper } from 'lucide-react';
import type { QuickAction } from '@/types/chat';

interface QuickActionsProps {
  onAction: (command: string) => void;
  disabled?: boolean;
}

const quickActions: QuickAction[] = [
  { icon: 'laugh', text: 'Tell me a joke', command: 'tell me a joke' },
  { icon: 'clock', text: 'What time is it?', command: 'what time is it' },
  { icon: 'newspaper', text: 'Latest news', command: 'what is the latest news' },
  { icon: 'calculator', text: 'Calculate 15 * 24', command: 'calculate 15 * 24' },
  { icon: 'help-circle', text: 'What is quantum computing?', command: 'what is quantum computing' },
  { icon: 'globe', text: 'Weather forecast', command: 'what is the weather forecast' },
];

const iconComponents = {
  laugh: Laugh,
  clock: Clock,
  newspaper: Newspaper,
  calculator: Calculator,
  'help-circle': HelpCircle,
  globe: Globe,
};

export function QuickActions({ onAction, disabled = false }: QuickActionsProps) {
  return (
    <aside className="w-64 bg-jarvis-surface border-r border-jarvis-surface-light p-4 hidden lg:block">
      <h3 className="text-lg font-semibold text-jarvis-primary mb-4">Quick Actions</h3>
      <div className="space-y-3">
        {quickActions.map((action, index) => {
          const IconComponent = iconComponents[action.icon as keyof typeof iconComponents];
          
          return (
            <button
              key={index}
              onClick={() => onAction(action.command)}
              disabled={disabled}
              className="w-full p-3 bg-jarvis-surface-light rounded-lg hover:bg-jarvis-secondary transition-all duration-200 text-left group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center space-x-3">
                <IconComponent className="w-5 h-5 text-jarvis-primary group-hover:text-white" />
                <span className="text-sm font-medium">{action.text}</span>
              </div>
            </button>
          );
        })}
      </div>
      
      <div className="mt-8">
        <h4 className="text-md font-semibold text-jarvis-primary mb-3">Recent Conversations</h4>
        <div className="space-y-2 text-sm">
          <div className="p-2 bg-jarvis-surface-light rounded cursor-pointer hover:bg-jarvis-secondary transition-colors">
            <span className="text-gray-300">Math calculations...</span>
          </div>
          <div className="p-2 bg-jarvis-surface-light rounded cursor-pointer hover:bg-jarvis-secondary transition-colors">
            <span className="text-gray-300">General conversation...</span>
          </div>
          <div className="p-2 bg-jarvis-surface-light rounded cursor-pointer hover:bg-jarvis-secondary transition-colors">
            <span className="text-gray-300">Technical questions...</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import type { Settings } from '@/types/chat';
import { X } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const modelOptions = [
  { value: 'meta-llama/llama-3.2-3b-instruct:free', label: 'Llama 3.2 3B (Free)' },
  { value: 'meta-llama/llama-3.1-8b-instruct:free', label: 'Llama 3.1 8B (Free)' },
  { value: 'meta-llama/llama-3.2-11b-vision-instruct:free', label: 'Llama 3.2 11B Vision (Free)' },
  { value: 'deepseek/deepseek-chat', label: 'DeepSeek Chat (Code & Math)' },
  { value: 'anthropic/claude-3-haiku', label: 'Claude 3 Haiku (Fast)' },
];

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    openRouterApiKey: '',
    wolframAppId: '',
    selectedModel: 'meta-llama/llama-3.2-3b-instruct:free',
    autoScroll: true,
    showTimestamps: true,
    compactMode: false,
  });

  // Load settings
  const { data: settingsData } = useQuery<{ settings: Settings }>({
    queryKey: ['/api/settings'],
  });

  useEffect(() => {
    if (settingsData?.settings) {
      setFormData({
        openRouterApiKey: '',
        wolframAppId: '',
        selectedModel: settingsData.settings.selectedModel,
        autoScroll: settingsData.settings.autoScroll === 'true',
        showTimestamps: settingsData.settings.showTimestamps === 'true',
        compactMode: settingsData.settings.compactMode === 'true',
      });
    }
  }, [settingsData]);

  // Save settings mutation
  const saveSettingsMutation = useMutation({
    mutationFn: async (settings: Partial<Settings>) => {
      const response = await apiRequest('POST', '/api/settings', settings);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
      onClose();
    },
  });

  const handleSave = () => {
    const settingsToSave = {
      userId: 'default',
      selectedModel: formData.selectedModel,
      autoScroll: formData.autoScroll.toString(),
      showTimestamps: formData.showTimestamps.toString(),
      compactMode: formData.compactMode.toString(),
      ...(formData.openRouterApiKey && { openRouterApiKey: formData.openRouterApiKey }),
      ...(formData.wolframAppId && { wolframAppId: formData.wolframAppId }),
    };
    
    saveSettingsMutation.mutate(settingsToSave);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-jarvis-surface border border-jarvis-surface-light max-w-lg">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold text-jarvis-primary">Settings</DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* API Configuration */}
          <div>
            <h4 className="text-lg font-medium text-white mb-3">API Configuration</h4>
            <div className="space-y-4">
              <div>
                <Label htmlFor="openrouter-key" className="text-sm font-medium text-gray-300">
                  OpenRouter API Key
                </Label>
                <Input
                  id="openrouter-key"
                  type="password"
                  value={formData.openRouterApiKey}
                  onChange={(e) => setFormData(prev => ({ ...prev, openRouterApiKey: e.target.value }))}
                  placeholder="sk-or-v1-..."
                  className="mt-1 bg-jarvis-surface-light border-jarvis-surface-light text-white placeholder-gray-400"
                />
              </div>
              <div>
                <Label htmlFor="wolfram-id" className="text-sm font-medium text-gray-300">
                  Wolfram Alpha App ID
                </Label>
                <Input
                  id="wolfram-id"
                  type="password"
                  value={formData.wolframAppId}
                  onChange={(e) => setFormData(prev => ({ ...prev, wolframAppId: e.target.value }))}
                  placeholder="XXXXXX-XXXXXXXXXX"
                  className="mt-1 bg-jarvis-surface-light border-jarvis-surface-light text-white placeholder-gray-400"
                />
              </div>
            </div>
          </div>
          
          {/* Model Selection */}
          <div>
            <Label className="text-lg font-medium text-white mb-3 block">AI Model</Label>
            <Select
              value={formData.selectedModel}
              onValueChange={(value) => setFormData(prev => ({ ...prev, selectedModel: value }))}
            >
              <SelectTrigger className="bg-jarvis-surface-light border-jarvis-surface-light text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-jarvis-surface-light border-jarvis-surface-light text-white">
                {modelOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Interface Preferences */}
          <div>
            <h4 className="text-lg font-medium text-white mb-3">Interface</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="auto-scroll"
                  checked={formData.autoScroll}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, autoScroll: checked === true }))}
                  className="border-jarvis-surface-light"
                />
                <Label htmlFor="auto-scroll" className="text-gray-300">
                  Auto-scroll to new messages
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="show-timestamps"
                  checked={formData.showTimestamps}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, showTimestamps: checked === true }))}
                  className="border-jarvis-surface-light"
                />
                <Label htmlFor="show-timestamps" className="text-gray-300">
                  Show message timestamps
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="compact-mode"
                  checked={formData.compactMode}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, compactMode: checked === true }))}
                  className="border-jarvis-surface-light"
                />
                <Label htmlFor="compact-mode" className="text-gray-300">
                  Compact message display
                </Label>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 mt-8">
          <Button
            variant="secondary"
            onClick={onClose}
            className="bg-jarvis-surface-light hover:bg-jarvis-secondary text-white"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saveSettingsMutation.isPending}
            className="bg-jarvis-primary text-jarvis-dark hover:bg-jarvis-secondary"
          >
            {saveSettingsMutation.isPending ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

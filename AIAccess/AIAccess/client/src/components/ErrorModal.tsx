import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertTriangle, X } from 'lucide-react';

interface ErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  error: string;
  onRetry?: () => void;
}

export function ErrorModal({ isOpen, onClose, error, onRetry }: ErrorModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-jarvis-surface border border-red-500 max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-6 h-6 text-red-500" />
              <DialogTitle className="text-lg font-semibold text-red-500">Error</DialogTitle>
            </div>
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
        
        <div className="mt-4">
          <p className="text-gray-300 mb-6">{error}</p>
          <div className="flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={onClose}
              className="bg-jarvis-surface-light hover:bg-jarvis-secondary text-white"
            >
              Close
            </Button>
            {onRetry && (
              <Button
                onClick={() => {
                  onRetry();
                  onClose();
                }}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Retry
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

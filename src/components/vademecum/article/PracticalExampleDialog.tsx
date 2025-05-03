
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PracticalExample } from './PracticalExample';

interface PracticalExampleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  articleNumber: string;
  example?: string;
  onNarration: ((text: string) => Promise<void>) | null;
}

export const PracticalExampleDialog: React.FC<PracticalExampleDialogProps> = ({
  isOpen,
  onClose,
  articleNumber,
  example,
  onNarration
}) => {
  const handleNarration = async (text: string) => {
    if (onNarration) {
      return onNarration(text);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Exemplo Prático - Artigo {articleNumber}</DialogTitle>
          <DialogDescription>
            Aplicação prática do artigo em situações reais.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <PracticalExample example={example || ''} onNarration={handleNarration} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PracticalExampleDialog;

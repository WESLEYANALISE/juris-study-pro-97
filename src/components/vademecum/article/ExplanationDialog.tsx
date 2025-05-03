
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ArticleExplanation } from './ArticleExplanation';

interface ExplanationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  articleNumber: string;
  technicalExplanation?: string;
  formalExplanation?: string;
  onNarration: ((text: string) => Promise<void>) | null;
}

export const ExplanationDialog: React.FC<ExplanationDialogProps> = ({
  isOpen,
  onClose,
  articleNumber,
  technicalExplanation,
  formalExplanation,
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
          <DialogTitle>Explicações do Artigo {articleNumber}</DialogTitle>
          <DialogDescription>
            Explicações técnicas e formais sobre este artigo.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <ArticleExplanation 
            technicalExplanation={technicalExplanation} 
            formalExplanation={formalExplanation} 
            onNarration={handleNarration} 
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExplanationDialog;

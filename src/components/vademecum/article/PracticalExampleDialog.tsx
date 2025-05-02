
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import ReactMarkdown from 'react-markdown';

interface PracticalExampleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  articleNumber: string;
  example?: string;
  onNarration?: ((text: string) => Promise<void>) | null;
}

export function PracticalExampleDialog({
  isOpen,
  onClose,
  articleNumber,
  example,
  onNarration
}: PracticalExampleDialogProps) {
  // Format example text to improve readability with markdown
  const formatExampleText = (text: string = ''): string => {
    if (!text) return '';
    
    return text
      // Add paragraph breaks after each sentence
      .replace(/\.(\s+|$)/g, '.\n\n')
      // Clean up consecutive line breaks
      .replace(/\n{3,}/g, '\n\n')
      // Format case titles
      .replace(/(Caso \d+|Exemplo \d+|Situação \d+):\s*([^\n]+)/gi, '## $1: $2')
      // Add emphasis to important terms
      .replace(/("[^"]+"|'[^']+')/g, '**$1**');
  };

  const formattedExample = formatExampleText(example);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Exemplo Prático - Artigo {articleNumber}</DialogTitle>
          <DialogDescription>
            Aplicação do artigo em situações reais
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 p-3 bg-muted/30 rounded-lg">
          <ReactMarkdown className="prose dark:prose-invert max-w-none prose-p:my-2 prose-headings:my-4">
            {formattedExample}
          </ReactMarkdown>
        </div>
      </DialogContent>
    </Dialog>
  );
}


import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import ReactMarkdown from 'react-markdown';
import { Button } from '@/components/ui/button';
import { Volume2, Copy } from 'lucide-react';
import { toast } from 'sonner';

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
  const [isNarrating, setIsNarrating] = React.useState(false);
  
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
  
  const handleCopy = async () => {
    if (!example) return;
    
    try {
      await navigator.clipboard.writeText(example);
      toast.success('Texto copiado para a área de transferência');
    } catch (error) {
      console.error('Failed to copy text:', error);
      toast.error('Não foi possível copiar o texto');
    }
  };
  
  const handleNarration = async () => {
    if (!onNarration || !example) return;
    
    try {
      if (isNarrating) {
        // Stop narration
        setIsNarrating(false);
        return;
      }
      
      setIsNarrating(true);
      await onNarration(example);
      setIsNarrating(false);
    } catch (error) {
      console.error('Error with narration:', error);
      toast.error('Não foi possível narrar o exemplo');
      setIsNarrating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Exemplo Prático - Artigo {articleNumber}</DialogTitle>
          <DialogDescription>
            Aplicação do artigo em situações reais
          </DialogDescription>
          
          {onNarration && example && (
            <div className="flex gap-2 mt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleNarration}
                className="gap-1"
              >
                <Volume2 className="h-4 w-4" />
                {isNarrating ? "Parar narração" : "Narrar exemplo"}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="gap-1"
              >
                <Copy className="h-4 w-4" />
                Copiar texto
              </Button>
            </div>
          )}
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

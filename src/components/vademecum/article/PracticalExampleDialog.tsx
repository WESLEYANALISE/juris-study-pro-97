
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Volume2, Copy } from 'lucide-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';

interface PracticalExampleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  articleNumber: string;
  example?: string;
  onNarration: (text: string) => Promise<void>;
}

export const PracticalExampleDialog = ({
  isOpen,
  onClose,
  articleNumber,
  example,
  onNarration
}: PracticalExampleDialogProps) => {
  const handleCopy = async (text: string) => {
    if (!text) return;
    
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Texto copiado para a área de transferência');
    } catch (error) {
      console.error('Failed to copy text:', error);
      toast.error('Não foi possível copiar o texto');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Exemplo Prático - Artigo {articleNumber}</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          {example ? (
            <div className="bg-muted/30 p-4 rounded-lg">
              <div className="flex items-center justify-between border-b pb-2 mb-3">
                <h4 className="font-medium">Exemplo Prático</h4>
                <div className="space-x-2">
                  <Button 
                    variant="purple" 
                    size="sm" 
                    className="gap-1"
                    onClick={() => onNarration(example)}
                    title="Narrar exemplo"
                  >
                    <Volume2 size={14} />
                    Narrar
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-1"
                    onClick={() => handleCopy(example)}
                    title="Copiar exemplo"
                  >
                    <Copy size={14} />
                    Copiar
                  </Button>
                </div>
              </div>
              <div className="prose dark:prose-invert max-w-none text-sm space-y-2">
                <ReactMarkdown>{example}</ReactMarkdown>
              </div>
            </div>
          ) : (
            <div className="p-4 text-center text-muted-foreground">
              Nenhum exemplo prático disponível para este artigo.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PracticalExampleDialog;

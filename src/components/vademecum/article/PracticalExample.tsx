
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Volume2, Copy } from 'lucide-react';
import { toast } from 'sonner';

interface PracticalExampleProps {
  example: string;
  onNarration: (text: string) => Promise<void>;
}

export const PracticalExample = ({ example, onNarration }: PracticalExampleProps) => {
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

  const formatText = (text: string | undefined) => {
    if (!text || typeof text !== 'string') return null;
    
    return text.split('\n').map((para, i) => (
      <p key={i} className="mb-3 last:mb-0">
        {para.trim()}
      </p>
    ));
  };

  if (!example) {
    return (
      <div className="p-2 text-center text-muted-foreground">
        Nenhum exemplo prático disponível para este artigo.
      </div>
    );
  }

  return (
    <ScrollArea className="h-full max-h-[350px]">
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h4 className="font-medium">Exemplo</h4>
          <div className="space-x-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => onNarration(example)}
              title="Narrar exemplo"
            >
              <Volume2 size={14} />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => handleCopy(example)}
              title="Copiar exemplo"
            >
              <Copy size={14} />
            </Button>
          </div>
        </div>
        <div className="text-sm">
          {formatText(example)}
        </div>
      </div>
    </ScrollArea>
  );
};

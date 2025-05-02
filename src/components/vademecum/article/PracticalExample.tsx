
import React from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, Copy } from 'lucide-react';
import { toast } from 'sonner';

interface PracticalExampleProps {
  example: string;
  onNarration?: (text: string) => Promise<void>;
}

export const PracticalExample = ({ 
  example, 
  onNarration = async () => {} // Default no-op function to make it optional
}: PracticalExampleProps) => {
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
    <div className="space-y-2 bg-muted/30 p-4 rounded-lg">
      <h4 className="font-medium mb-3 flex items-center justify-between border-b pb-2">
        Exemplo Prático
        <div className="space-x-2">
          <Button 
            variant="purple" 
            size="sm" 
            className="gap-1"
            onClick={() => onNarration?.(example)}
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
      </h4>
      <div className="text-sm space-y-2">
        {formatText(example)}
      </div>
    </div>
  );
};

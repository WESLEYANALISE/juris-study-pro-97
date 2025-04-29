
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Volume2, Copy } from 'lucide-react';
import { toast } from 'sonner';

interface ArticleExplanationProps {
  technicalExplanation?: string;
  formalExplanation?: string;
  onNarration: (text: string) => Promise<void>;
}

export const ArticleExplanation = ({ 
  technicalExplanation, 
  formalExplanation,
  onNarration 
}: ArticleExplanationProps) => {
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

  if (!technicalExplanation && !formalExplanation) {
    return (
      <div className="p-2 text-center text-muted-foreground">
        Nenhuma explicação disponível para este artigo.
      </div>
    );
  }

  return (
    <ScrollArea className="h-full max-h-[350px]">
      <div className="space-y-4">
        {technicalExplanation && (
          <div>
            <h4 className="font-medium mb-2 flex items-center justify-between">
              Explicação Técnica
              <div className="space-x-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => onNarration(technicalExplanation)}
                  title="Narrar explicação técnica"
                >
                  <Volume2 size={14} />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleCopy(technicalExplanation)}
                  title="Copiar explicação técnica"
                >
                  <Copy size={14} />
                </Button>
              </div>
            </h4>
            <div className="text-sm">
              {formatText(technicalExplanation)}
            </div>
          </div>
        )}
        {formalExplanation && (
          <div>
            <h4 className="font-medium mb-2 flex items-center justify-between">
              Explicação Formal
              <div className="space-x-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => onNarration(formalExplanation)}
                  title="Narrar explicação formal"
                >
                  <Volume2 size={14} />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleCopy(formalExplanation)}
                  title="Copiar explicação formal"
                >
                  <Copy size={14} />
                </Button>
              </div>
            </h4>
            <div className="text-sm">
              {formatText(formalExplanation)}
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  );
};

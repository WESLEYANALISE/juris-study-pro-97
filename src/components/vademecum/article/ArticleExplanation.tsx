
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Volume2, Copy } from 'lucide-react';
import { motion } from 'framer-motion';
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
    await navigator.clipboard.writeText(text);
    toast.success('Texto copiado para a área de transferência');
  };

  const formatText = (text: string) => {
    if (!text) return '';
    return text.split('\n').map((para, i) => (
      <p key={i} className="mb-3 last:mb-0">
        {para.trim()}
      </p>
    ));
  };

  return (
    <ScrollArea className="h-full max-h-[350px]">
      <div className="space-y-4">
        {technicalExplanation && (
          <div>
            <h4 className="font-medium mb-2 flex items-center justify-between">
              Explicação Técnica
              <div className="space-x-2">
                <Button variant="ghost" size="icon" onClick={() => onNarration(technicalExplanation)}>
                  <Volume2 size={14} />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleCopy(technicalExplanation)}>
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
                <Button variant="ghost" size="icon" onClick={() => onNarration(formalExplanation)}>
                  <Volume2 size={14} />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleCopy(formalExplanation)}>
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

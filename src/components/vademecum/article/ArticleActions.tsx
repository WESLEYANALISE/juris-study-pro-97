
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Info, FileText, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { ExplanationDialog } from './ExplanationDialog';
import { PracticalExampleDialog } from './PracticalExampleDialog';

interface ArticleActionsProps {
  articleText: string;
  articleNumber: string;
  technicalExplanation?: string;
  formalExplanation?: string;
  practicalExample?: string;
  handleNarration: (text: string) => Promise<void>;
}

export const ArticleActions = ({
  articleText,
  articleNumber,
  technicalExplanation,
  formalExplanation,
  practicalExample,
  handleNarration
}: ArticleActionsProps) => {
  const [isExplanationDialogOpen, setIsExplanationDialogOpen] = useState(false);
  const [isPracticalExampleDialogOpen, setIsPracticalExampleDialogOpen] = useState(false);

  const handleCopy = async (text: string) => {
    if (!text) return;
    
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Texto copiado para a área de transferência');
    } catch (err) {
      console.error("Erro ao copiar texto:", err);
      toast.error('Erro ao copiar texto. Por favor, tente novamente.');
    }
  };

  return (
    <>
      <div className="flex flex-wrap gap-2 pt-4 border-t">
        <Button 
          variant="purple" 
          className="gap-2"
          onClick={() => setIsExplanationDialogOpen(true)}
          disabled={!technicalExplanation && !formalExplanation}
        >
          <Info size={16} />
          Explicação
        </Button>

        {practicalExample && (
          <Button 
            variant="purple" 
            className="gap-2"
            onClick={() => setIsPracticalExampleDialogOpen(true)}
          >
            <FileText size={16} />
            Exemplo Prático
          </Button>
        )}

        <Button 
          variant="purple" 
          size="icon" 
          onClick={() => handleCopy(articleText)} 
          title="Copiar artigo"
          className="hover:scale-105 transition-transform"
        >
          <Copy size={16} />
        </Button>
      </div>

      {/* Explanation Dialog */}
      <ExplanationDialog 
        isOpen={isExplanationDialogOpen} 
        onClose={() => setIsExplanationDialogOpen(false)}
        articleNumber={articleNumber}
        technicalExplanation={technicalExplanation}
        formalExplanation={formalExplanation}
        onNarration={handleNarration}
      />

      {/* Practical Example Dialog */}
      <PracticalExampleDialog
        isOpen={isPracticalExampleDialogOpen}
        onClose={() => setIsPracticalExampleDialogOpen(false)}
        articleNumber={articleNumber}
        example={practicalExample}
        onNarration={handleNarration}
      />
    </>
  );
};

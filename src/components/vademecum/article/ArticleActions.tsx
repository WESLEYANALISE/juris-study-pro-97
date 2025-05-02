
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Info, FileText, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { ExplanationDialog } from './ExplanationDialog';
import { PracticalExampleDialog } from './PracticalExampleDialog';
import { motion, AnimatePresence } from 'framer-motion';
import { AnnotationButton } from './AnnotationButton';
import { useAuth } from '@/hooks/use-auth';

interface ArticleActionsProps {
  articleText: string;
  articleNumber: string;
  technicalExplanation?: string;
  formalExplanation?: string;
  practicalExample?: string;
  handleNarration: (text: string) => Promise<void>;
  isVisible: boolean;
  lawName: string;
}

export const ArticleActions = ({
  articleText,
  articleNumber,
  technicalExplanation,
  formalExplanation,
  practicalExample,
  handleNarration,
  isVisible,
  lawName
}: ArticleActionsProps) => {
  const { user } = useAuth();
  const [isExplanationDialogOpen, setIsExplanationDialogOpen] = useState(false);
  const [isPracticalExampleDialogOpen, setIsPracticalExampleDialogOpen] = useState(false);
  const [isCopying, setIsCopying] = useState(false);

  const handleCopy = async (text: string) => {
    if (!text) return;
    
    setIsCopying(true);
    
    try {
      // Try the modern clipboard API first
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        toast.success('Texto copiado para a área de transferência');
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        const successful = document.execCommand('copy');
        if (successful) {
          toast.success('Texto copiado para a área de transferência');
        } else {
          toast.error('Não foi possível copiar o texto');
        }
        
        document.body.removeChild(textArea);
      }
    } catch (err) {
      console.error("Erro ao copiar texto:", err);
      toast.error('Erro ao copiar texto. Por favor, tente novamente.');
    } finally {
      setIsCopying(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isVisible && (
          <motion.div 
            className="flex flex-wrap gap-2 pt-4 border-t"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <Button 
              variant="outline" 
              size="sm"
              className="gap-2 bg-primary/5 hover:bg-primary/10 text-primary-foreground"
              onClick={() => setIsExplanationDialogOpen(true)}
              disabled={!technicalExplanation && !formalExplanation}
            >
              <Info size={16} />
              <span>Explicação</span>
            </Button>

            {practicalExample && (
              <Button 
                variant="outline"
                size="sm"
                className="gap-2 bg-primary/5 hover:bg-primary/10 text-primary-foreground"
                onClick={() => setIsPracticalExampleDialogOpen(true)}
              >
                <FileText size={16} />
                <span>Exemplo Prático</span>
              </Button>
            )}

            <Button 
              variant="outline"
              size="sm"
              className="gap-2 bg-primary/5 hover:bg-primary/10 text-primary-foreground"
              onClick={() => handleCopy(articleText)} 
              disabled={isCopying}
            >
              <Copy size={16} />
              <span>Copiar</span>
            </Button>
            
            {/* New annotation button, only shown for logged-in users */}
            {user && articleNumber && (
              <AnnotationButton 
                lawName={lawName} 
                articleNumber={articleNumber} 
                articleText={articleText} 
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Explanation Dialog */}
      <ExplanationDialog 
        isOpen={isExplanationDialogOpen} 
        onClose={() => setIsExplanationDialogOpen(false)}
        articleNumber={articleNumber}
        technicalExplanation={technicalExplanation}
        formalExplanation={formalExplanation}
        onNarration={null} // Disabling narration for explanations
      />

      {/* Practical Example Dialog */}
      <PracticalExampleDialog
        isOpen={isPracticalExampleDialogOpen}
        onClose={() => setIsPracticalExampleDialogOpen(false)}
        articleNumber={articleNumber}
        example={practicalExample}
        onNarration={null} // Disabling narration for examples
      />
    </>
  );
};

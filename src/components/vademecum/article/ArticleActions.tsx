
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Info, FileText, Copy, BookOpen, Highlighter, PencilLine, Volume2 } from 'lucide-react';
import { toast } from 'sonner';
import { ExplanationDialog } from './ExplanationDialog';
import { PracticalExampleDialog } from './PracticalExampleDialog';
import { motion, AnimatePresence } from 'framer-motion';
import { AnnotationButton } from './AnnotationButton';
import { useAuth } from '@/hooks/use-auth';
import { NarrationControls } from './NarrationControls';
import { TextToSpeechService } from '@/services/textToSpeechService';

interface ArticleActionsProps {
  articleText: string;
  articleNumber: string;
  technicalExplanation?: string;
  formalExplanation?: string;
  practicalExample?: string;
  isVisible: boolean;
  lawName: string;
}

export const ArticleActions = ({
  articleText,
  articleNumber,
  technicalExplanation,
  formalExplanation,
  practicalExample,
  isVisible,
  lawName
}: ArticleActionsProps) => {
  const { user } = useAuth();
  const [isExplanationDialogOpen, setIsExplanationDialogOpen] = useState(false);
  const [isPracticalExampleDialogOpen, setIsPracticalExampleDialogOpen] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [isNarrating, setIsNarrating] = useState(false);
  
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

  const handleNarration = async () => {
    if (isNarrating) {
      TextToSpeechService.stop();
      setIsNarrating(false);
      return;
    }

    try {
      setIsNarrating(true);
      await TextToSpeechService.speak(articleText, 'pt-BR-Wavenet-D');
      setIsNarrating(false);
    } catch (error) {
      console.error("Erro na narração:", error);
      toast.error("Não foi possível iniciar a narração");
      setIsNarrating(false);
    }
  };

  const handleHighlight = () => {
    const contentElement = document.getElementById(`article-content-${articleNumber}`);
    if (contentElement) {
      const selection = window.getSelection();
      if (selection && selection.toString()) {
        try {
          // Create a highlight span
          const range = selection.getRangeAt(0);
          const span = document.createElement("span");
          span.className = "bg-yellow-200 dark:bg-yellow-800";
          range.surroundContents(span);
          toast.success("Texto destacado com sucesso");
        } catch (e) {
          toast.error("Não foi possível destacar este texto");
          console.error("Erro ao destacar texto:", e);
        }
      } else {
        toast.info("Selecione o texto que deseja destacar");
      }
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
            
            <Button 
              variant="outline"
              size="sm"
              className={`gap-2 ${isNarrating ? "bg-primary/20" : "bg-primary/5"} hover:bg-primary/10 text-primary-foreground`}
              onClick={handleNarration}
            >
              <Volume2 size={16} />
              <span>{isNarrating ? "Parar" : "Narrar"}</span>
            </Button>

            <Button 
              variant="outline"
              size="sm"
              className="gap-2 bg-primary/5 hover:bg-primary/10 text-primary-foreground"
              onClick={handleHighlight}
            >
              <Highlighter size={16} />
              <span>Destacar</span>
            </Button>
            
            {/* Annotation button, only shown for logged-in users */}
            {user && articleNumber && (
              <AnnotationButton 
                lawName={lawName} 
                articleNumber={articleNumber} 
                articleText={articleText} 
                showLabel={true}
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
        onNarration={TextToSpeechService.speak}
      />

      {/* Practical Example Dialog */}
      <PracticalExampleDialog
        isOpen={isPracticalExampleDialogOpen}
        onClose={() => setIsPracticalExampleDialogOpen(false)}
        articleNumber={articleNumber}
        example={practicalExample}
        onNarration={TextToSpeechService.speak}
      />
    </>
  );
};

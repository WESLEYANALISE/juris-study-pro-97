
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Info, FileText, Copy, PencilLine, Highlighter } from 'lucide-react';
import { toast } from 'sonner';
import { ExplanationDialog } from './ExplanationDialog';
import { PracticalExampleDialog } from './PracticalExampleDialog';
import { motion, AnimatePresence } from 'framer-motion';
import { AnnotationButton } from './AnnotationButton';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useAuth } from '@/hooks/use-auth';
import { NarrationControls } from './NarrationControls';

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
  const [isNarrating, setIsNarrating] = useState(false);
  const [explanationType, setExplanationType] = useState<'technical' | 'formal' | null>(null);

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

  const handleOpenExplanation = (type: 'technical' | 'formal') => {
    setExplanationType(type);
    setIsExplanationDialogOpen(true);
  };

  const handleHighlight = () => {
    const selection = window.getSelection();
    if (selection && selection.toString()) {
      toast.success('Texto destacado');
    } else {
      toast.info('Selecione um texto para destacar');
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
            {/* Explanation Buttons */}
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="gap-2 bg-[#9b87f5]/10 hover:bg-[#9b87f5]/20 border-[#9b87f5]/30"
                  disabled={!technicalExplanation && !formalExplanation}
                >
                  <Info size={16} />
                  <span>Explicação</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64">
                <div className="space-y-2">
                  <h4 className="font-medium">Tipo de Explicação</h4>
                  <p className="text-sm text-muted-foreground">Escolha o tipo de explicação:</p>
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleOpenExplanation('technical')}
                      disabled={!technicalExplanation}
                    >
                      Técnica
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleOpenExplanation('formal')}
                      disabled={!formalExplanation}
                    >
                      Formal
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {/* Practical Example Button */}
            {practicalExample && (
              <Button 
                variant="outline"
                size="sm"
                className="gap-2 bg-[#9b87f5]/10 hover:bg-[#9b87f5]/20 border-[#9b87f5]/30"
                onClick={() => setIsPracticalExampleDialogOpen(true)}
              >
                <FileText size={16} />
                <span>Exemplo Prático</span>
              </Button>
            )}

            {/* Copy Button */}
            <Button 
              variant="outline"
              size="sm"
              className="gap-2 bg-[#9b87f5]/10 hover:bg-[#9b87f5]/20 border-[#9b87f5]/30"
              onClick={() => handleCopy(articleText)} 
              disabled={isCopying}
            >
              <Copy size={16} />
              <span>Copiar</span>
            </Button>

            {/* Narration Button */}
            <NarrationControls 
              text={articleText}
              isNarrating={isNarrating}
              setIsNarrating={setIsNarrating}
              showLabel={true}
            />
            
            {/* New highlight button */}
            <Button 
              variant="outline"
              size="sm"
              className="gap-2 bg-[#9b87f5]/10 hover:bg-[#9b87f5]/20 border-[#9b87f5]/30"
              onClick={handleHighlight}
            >
              <Highlighter size={16} />
              <span>Destacar</span>
            </Button>
            
            {/* New annotation button, only shown for logged-in users */}
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

      {/* Explanation Dialog with conditional content */}
      <ExplanationDialog 
        isOpen={isExplanationDialogOpen} 
        onClose={() => setIsExplanationDialogOpen(false)}
        articleNumber={articleNumber}
        technicalExplanation={explanationType === 'technical' ? technicalExplanation : undefined}
        formalExplanation={explanationType === 'formal' ? formalExplanation : undefined}
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

export default ArticleActions;

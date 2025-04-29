
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Info, FileText, Copy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { TextToSpeechService } from '@/services/textToSpeechService';
import { useAuth } from '@/hooks/use-auth';
import { NarrationControls } from './article/NarrationControls';
import { BookmarkButton } from './article/BookmarkButton';
import { FontSizeControls } from './article/FontSizeControls';
import { ArticleExplanation } from './article/ArticleExplanation';
import { PracticalExample } from './article/PracticalExample';
import { supabase } from '@/integrations/supabase/client';
import { useIsMobile } from '@/hooks/use-mobile';

interface ArticleCardProps {
  lawName: string;
  articleNumber: string;
  articleText: string;
  technicalExplanation?: string;
  formalExplanation?: string;
  practicalExample?: string;
  fontSize: number;
  onFontSizeChange: (size: number) => void;
}

export const ArticleCard = ({
  lawName,
  articleNumber,
  articleText,
  technicalExplanation,
  formalExplanation,
  practicalExample,
  fontSize,
  onFontSizeChange
}: ArticleCardProps) => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [isNarrating, setIsNarrating] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isExplanationDialogOpen, setIsExplanationDialogOpen] = useState(false);
  const [isPracticalExampleDialogOpen, setIsPracticalExampleDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // For debugging
  useEffect(() => {
    console.log('ArticleCard props:', {
      lawName,
      articleNumber,
      articleTextLength: articleText?.length || 0,
      hasTechnicalExplanation: !!technicalExplanation,
      hasFormalExplanation: !!formalExplanation,
      hasPracticalExample: !!practicalExample
    });
  }, [lawName, articleNumber, articleText, technicalExplanation, formalExplanation, practicalExample]);

  useEffect(() => {
    if (user) {
      checkIsFavorite();
    }
  }, [user, lawName, articleNumber]);

  const checkIsFavorite = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('vademecum_favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('law_name', lawName)
        .eq('article_number', articleNumber)
        .maybeSingle();
      
      if (error) {
        console.error("Erro ao verificar favorito:", error);
        toast.error("Erro ao verificar status de favorito");
        return;
      }
      
      setIsFavorite(!!data);
    } catch (err) {
      console.error("Exceção ao verificar favorito:", err);
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleNarration = async (text: string) => {
    if (!text) return;
    
    try {
      if (isNarrating) {
        TextToSpeechService.stop();
        setIsNarrating(false);
        return;
      }
      
      setIsNarrating(true);
      await TextToSpeechService.speak(text);
    } catch (err) {
      console.error("Erro na narração:", err);
      toast.error('Erro ao iniciar narração. Por favor, tente novamente.');
    } finally {
      setIsNarrating(false);
    }
  };

  // Helper function to safely format text
  const formatArticleText = (text: string | undefined) => {
    if (!text || typeof text !== 'string') return []; 
    
    return text.split('\n').map((para, i) => (
      <p key={i} className="mb-3 last:mb-0">{para.trim()}</p>
    ));
  };

  // Check if we have a valid article to display
  if (!articleNumber?.trim() && !articleText?.trim()) {
    return null; // Don't render invalid articles
  }

  // Determine if this is a heading (no article number)
  const isHeading = !articleNumber?.trim() && articleText?.trim();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: isMobile ? 0.2 : 0.3 }}
      className="will-change-transform"
    >
      <Card className="p-4 md:p-6 space-y-4 shadow-card hover:shadow-hover transition-all duration-300">
        <div className="flex justify-between items-start">
          <div className={`flex flex-col ${isHeading ? "w-full" : ""}`}>
            {articleNumber?.trim() ? (
              <h3 className="text-lg font-semibold">Art. {articleNumber}</h3>
            ) : null}
            <div 
              style={{ fontSize: `${fontSize}px` }} 
              className={`mt-2 whitespace-pre-line text-left px-1 py-3 ml-0 ${isHeading ? "text-center w-full font-semibold" : ""}`}
            >
              {formatArticleText(articleText)}
            </div>
          </div>
          {!isHeading && (
            <div className="flex flex-col gap-2">
              <NarrationControls 
                text={articleText} 
                isNarrating={isNarrating} 
                setIsNarrating={setIsNarrating} 
              />
              <BookmarkButton 
                isFavorite={isFavorite} 
                setIsFavorite={setIsFavorite}
                lawName={lawName} 
                articleNumber={articleNumber} 
                articleText={articleText}
                isLoading={isLoading}
              />
            </div>
          )}
        </div>

        {!isHeading && (
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

            <FontSizeControls 
              fontSize={fontSize} 
              onFontSizeChange={onFontSizeChange} 
            />

            <Button 
              variant="purple" 
              size="icon" 
              onClick={() => handleCopy(articleText)} 
              title="Copiar artigo"
            >
              <Copy size={16} />
            </Button>
          </div>
        )}

        {/* Explanation Dialog */}
        <Dialog open={isExplanationDialogOpen} onOpenChange={setIsExplanationDialogOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-auto">
            <DialogHeader>
              <DialogTitle>Explicação do Artigo {articleNumber}</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <ArticleExplanation 
                technicalExplanation={technicalExplanation} 
                formalExplanation={formalExplanation} 
                onNarration={handleNarration} 
              />
            </div>
          </DialogContent>
        </Dialog>

        {/* Practical Example Dialog */}
        <Dialog open={isPracticalExampleDialogOpen} onOpenChange={setIsPracticalExampleDialogOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-auto">
            <DialogHeader>
              <DialogTitle>Exemplo Prático - Artigo {articleNumber}</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <PracticalExample 
                example={practicalExample} 
                onNarration={handleNarration} 
              />
            </div>
          </DialogContent>
        </Dialog>
      </Card>
    </motion.div>
  );
};

export default ArticleCard;

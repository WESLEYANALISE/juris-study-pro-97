
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
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
  const {
    user
  } = useAuth();
  const [isNarrating, setIsNarrating] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isPracticalExampleOpen, setIsPracticalExampleOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      checkIsFavorite();
    }
  }, [user, lawName, articleNumber]);

  const checkIsFavorite = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      console.log(`Verificando favorito para usuário: ${user.id}, lei: ${lawName}, artigo: ${articleNumber}`);
      
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
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Texto copiado para a área de transferência');
    } catch (err) {
      console.error("Erro ao copiar texto:", err);
      toast.error('Erro ao copiar texto. Por favor, tente novamente.');
    }
  };

  const handleNarration = async (text: string) => {
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

  return <motion.div 
    initial={{ opacity: 0, y: 20 }} 
    animate={{ opacity: 1, y: 0 }} 
    transition={{ duration: 0.3 }}
  >
      <Card className="p-6 space-y-4 shadow-card hover:shadow-hover transition-all duration-300">
        <div className="flex justify-between items-start">
          <motion.div 
            className="flex flex-col" 
            whileHover={{ scale: 1.01 }} 
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <h3 className="text-lg font-semibold">Art. {articleNumber}</h3>
            <div 
              style={{ fontSize: `${fontSize}px` }} 
              className="mt-2 whitespace-pre-line text-left px-1 py-3 ml-0"
            >
              {articleText.split('\n').map((para, i) => (
                <p key={i} className="mb-3 last:mb-0">{para.trim()}</p>
              ))}
            </div>
          </motion.div>
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
        </div>

        <div className="flex flex-wrap gap-2 pt-4 border-t">
          <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
            <PopoverTrigger asChild>
              <motion.div 
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  variant="outline" 
                  className="gap-2"
                  disabled={!technicalExplanation && !formalExplanation}
                >
                  <Info size={16} />
                  Explicação
                </Button>
              </motion.div>
            </PopoverTrigger>
            <AnimatePresence>
              {isPopoverOpen && (
                <PopoverContent 
                  sideOffset={5} 
                  className="w-80 max-h-[400px] overflow-auto px-[10px] mx-[27px] my-[12px] py-[4px]"
                >
                  <ArticleExplanation 
                    technicalExplanation={technicalExplanation} 
                    formalExplanation={formalExplanation} 
                    onNarration={handleNarration} 
                  />
                </PopoverContent>
              )}
            </AnimatePresence>
          </Popover>

          {practicalExample && (
            <Popover open={isPracticalExampleOpen} onOpenChange={setIsPracticalExampleOpen}>
              <PopoverTrigger asChild>
                <motion.div 
                  whileHover={{ scale: 1.05 }} 
                  whileTap={{ scale: 0.95 }}
                >
                  <Button variant="outline" className="gap-2">
                    <FileText size={16} />
                    Exemplo Prático
                  </Button>
                </motion.div>
              </PopoverTrigger>
              <AnimatePresence>
                {isPracticalExampleOpen && (
                  <PopoverContent 
                    className="w-80 max-h-[400px] overflow-auto" 
                    sideOffset={5}
                  >
                    <PracticalExample 
                      example={practicalExample} 
                      onNarration={handleNarration} 
                    />
                  </PopoverContent>
                )}
              </AnimatePresence>
            </Popover>
          )}

          <FontSizeControls 
            fontSize={fontSize} 
            onFontSizeChange={onFontSizeChange} 
          />

          <motion.div 
            whileHover={{ scale: 1.1 }} 
            whileTap={{ scale: 0.9 }}
          >
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => handleCopy(articleText)} 
              title="Copiar artigo"
            >
              <Copy size={16} />
            </Button>
          </motion.div>
        </div>
      </Card>
    </motion.div>;
};

export default ArticleCard;

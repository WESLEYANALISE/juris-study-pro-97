
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Volume2, Bookmark, BookmarkCheck, Copy, Info, ZoomIn, ZoomOut, FileText, Pause } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { TextToSpeechService } from '@/services/textToSpeechService';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/lib/supabaseClient';
import { ScrollArea } from '@/components/ui/scroll-area';

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

const ArticleCard = ({
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
  const [isNarrating, setIsNarrating] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isPracticalExampleOpen, setIsPracticalExampleOpen] = useState(false);

  // Check if article is favorited on component mount
  useEffect(() => {
    if (user) {
      checkIsFavorite();
    }
  }, [user]);

  const checkIsFavorite = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('vademecum_favorites')
      .select('id')
      .eq('user_id', user.id)
      .eq('law_name', lawName)
      .eq('article_number', articleNumber)
      .single();
    setIsFavorite(!!data);
  };

  const handleNarration = async (text: string) => {
    if (isNarrating) {
      TextToSpeechService.stop();
      setIsNarrating(false);
    } else {
      setIsNarrating(true);
      await TextToSpeechService.speak(text);
      setIsNarrating(false);
    }
  };

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    toast.success('Texto copiado para a área de transferência');
  };

  const toggleFavorite = async () => {
    if (!user) {
      toast.error('Você precisa estar logado para favoritar artigos');
      return;
    }
    try {
      if (isFavorite) {
        await supabase
          .from('vademecum_favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('law_name', lawName)
          .eq('article_number', articleNumber);
      } else {
        await supabase
          .from('vademecum_favorites')
          .insert({
            user_id: user.id,
            law_name: lawName,
            article_id: articleNumber,
            article_number: articleNumber,
            article_text: articleText
          });
      }
      setIsFavorite(!isFavorite);
      toast.success(isFavorite ? 'Artigo removido dos favoritos' : 'Artigo adicionado aos favoritos');
    } catch (error) {
      toast.error('Erro ao atualizar favoritos');
    }
  };

  // Format text with paragraphs
  const formatText = (text: string) => {
    if (!text) return '';
    return text.split('\n').map((para, i) => (
      <p key={i} className="mb-3 last:mb-0">
        {para.trim()}
      </p>
    ));
  };

  return (
    <motion.div
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
              {formatText(articleText)}
            </div>
          </motion.div>
          <div className="flex flex-col gap-2">
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => handleNarration(articleText)}
                className={isNarrating ? 'bg-primary text-primary-foreground border-primary' : ''}
              >
                {isNarrating ? <Pause className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
              <Button variant="outline" size="icon" onClick={toggleFavorite}>
                {isFavorite ? <BookmarkCheck className="text-primary h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
              </Button>
            </motion.div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-4 border-t">
          <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
            <PopoverTrigger asChild>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="outline" className="gap-2">
                  <Info size={16} />
                  Explicação
                </Button>
              </motion.div>
            </PopoverTrigger>
            <AnimatePresence>
              {isPopoverOpen && (
                <PopoverContent 
                  className="w-80 max-h-[400px] overflow-auto" 
                  sideOffset={5}
                  asChild
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ type: 'spring', bounce: 0.3 }}
                  >
                    <ScrollArea className="h-full max-h-[350px]">
                      <div className="space-y-4">
                        {technicalExplanation && (
                          <div>
                            <h4 className="font-medium mb-2 flex items-center justify-between">
                              Explicação Técnica
                              <div className="space-x-2">
                                <Button variant="ghost" size="icon" onClick={() => handleNarration(technicalExplanation)}>
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
                                <Button variant="ghost" size="icon" onClick={() => handleNarration(formalExplanation)}>
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
                  </motion.div>
                </PopoverContent>
              )}
            </AnimatePresence>
          </Popover>

          {practicalExample && (
            <Popover open={isPracticalExampleOpen} onOpenChange={setIsPracticalExampleOpen}>
              <PopoverTrigger asChild>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
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
                    asChild
                  >
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ type: 'spring', bounce: 0.3 }}
                    >
                      <ScrollArea className="h-full max-h-[350px]">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <h4 className="font-medium">Exemplo</h4>
                            <div className="space-x-2">
                              <Button variant="ghost" size="icon" onClick={() => handleNarration(practicalExample)}>
                                <Volume2 size={14} />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleCopy(practicalExample)}>
                                <Copy size={14} />
                              </Button>
                            </div>
                          </div>
                          <div className="text-sm">
                            {formatText(practicalExample)}
                          </div>
                        </div>
                      </ScrollArea>
                    </motion.div>
                  </PopoverContent>
                )}
              </AnimatePresence>
            </Popover>
          )}

          <div className="flex items-center gap-1">
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button
                variant="outline"
                size="icon"
                onClick={() => onFontSizeChange(fontSize - 1)}
                disabled={fontSize <= 12}
                title="Diminuir fonte"
              >
                <ZoomOut size={16} />
              </Button>
            </motion.div>

            <motion.div
              className="px-2 py-1 border rounded-md bg-muted min-w-[40px] text-center"
              initial={{ scale: 1 }}
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 0.3 }}
            >
              {fontSize}
            </motion.div>

            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button
                variant="outline"
                size="icon"
                onClick={() => onFontSizeChange(fontSize + 1)}
                disabled={fontSize >= 32}
                title="Aumentar fonte"
              >
                <ZoomIn size={16} />
              </Button>
            </motion.div>
          </div>

          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Button variant="outline" size="icon" onClick={() => handleCopy(articleText)} title="Copiar artigo">
              <Copy size={16} />
            </Button>
          </motion.div>
        </div>
      </Card>
    </motion.div>
  );
};

export default React.memo(ArticleCard);

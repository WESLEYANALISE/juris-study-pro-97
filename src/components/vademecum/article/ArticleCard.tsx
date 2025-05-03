
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp, Volume2, BookmarkPlus, PencilLine, Highlighter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArticleContent } from './ArticleContent';
import { ArticleDetails } from './ArticleDetails';
import { cn } from '@/lib/utils';
import { TextToSpeechService } from '@/services/textToSpeechService';
import { ArticleActions } from './ArticleActions';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';

interface ArticleCardProps {
  articleId: string;
  articleNumber: string;
  articleText: string;
  technicalExplanation?: string;
  formalExplanation?: string;
  practicalExample?: string;
  lawName: string;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  favoriteIcon?: React.ReactNode;
  fontSize?: number;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({
  articleId,
  articleNumber,
  articleText,
  technicalExplanation,
  formalExplanation,
  practicalExample,
  lawName,
  isFavorite = false,
  onToggleFavorite,
  favoriteIcon,
  fontSize = 16
}) => {
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [isNarrating, setIsNarrating] = useState(false);
  const [selectedText, setSelectedText] = useState<string | null>(null);
  
  const hasDetails = technicalExplanation || formalExplanation || practicalExample;
  const isHeading = !articleNumber && (articleText?.includes('TÍTULO') || articleText?.includes('CAPÍTULO'));
  
  // Toggle expanded state with animation
  const toggleExpanded = () => {
    setIsExpanded(prev => !prev);
    if (isExpanded) {
      setShowDetails(false);
    }
  };

  // Toggle details panel
  const toggleDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDetails(prev => !prev);
  };

  // Handle narration of article text
  const handleNarration = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (isNarrating) {
      TextToSpeechService.stop();
      setIsNarrating(false);
      return;
    }
    
    try {
      setIsNarrating(true);
      await TextToSpeechService.speak(articleText);
      setIsNarrating(false);
    } catch (error) {
      console.error('Error with text-to-speech:', error);
      toast.error('Não foi possível iniciar a narração');
      setIsNarrating(false);
    }
  };

  // Handle annotation
  const handleAnnotation = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!user) {
      toast.error('Você precisa estar logado para anotar artigos');
      return;
    }
    
    // Get selected text if any
    const selection = window.getSelection();
    if (selection && selection.toString()) {
      setSelectedText(selection.toString());
    } else {
      setSelectedText(null);
    }
    
    // Mock functionality - in a real app, this would open annotation dialog or save to DB
    toast.success('Funcionalidade de anotação em desenvolvimento');
  };

  // Handle highlighting
  const handleHighlight = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!user) {
      toast.error('Você precisa estar logado para destacar artigos');
      return;
    }
    
    // Get selected text if any
    const selection = window.getSelection();
    if (selection && selection.toString()) {
      setSelectedText(selection.toString());
      toast.success('Texto destacado');
    } else {
      toast.info('Selecione um texto para destacar');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card 
        className={cn(
          "shadow-sm hover:shadow-md transition-all overflow-hidden border",
          isHeading ? "bg-muted/30" : "",
          isFavorite ? "border-primary" : ""
        )}
      >
        <div 
          className={cn(
            "cursor-pointer",
            isHeading ? "py-3 px-4" : "p-4"
          )}
          onClick={toggleExpanded}
        >
          <div className="flex justify-between items-start">
            <ArticleContent 
              articleNumber={articleNumber}
              articleText={articleText}
              fontSize={fontSize}
              isHeading={isHeading}
            />
            
            <div className="flex items-center gap-1">
              {/* Narration button */}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleNarration}
                title={isNarrating ? "Parar narração" : "Narrar artigo"}
              >
                <Volume2 size={18} className={isNarrating ? "text-primary animate-pulse" : ""} />
              </Button>
              
              {/* Highlight button */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    title="Destacar texto"
                  >
                    <Highlighter size={18} />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64">
                  <div className="space-y-2">
                    <h4 className="font-medium">Destacar Texto</h4>
                    <p className="text-sm text-muted-foreground">Selecione o texto e clique para destacar.</p>
                    <Button 
                      variant="default" 
                      size="sm" 
                      className="w-full"
                      onClick={handleHighlight}
                    >
                      <Highlighter size={16} className="mr-2" /> Destacar Seleção
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
              
              {/* Annotation button */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    title="Anotar artigo"
                  >
                    <PencilLine size={18} />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64">
                  <div className="space-y-2">
                    <h4 className="font-medium">Anotar Artigo</h4>
                    <p className="text-sm text-muted-foreground">Adicione uma anotação para este artigo.</p>
                    <Button 
                      variant="default" 
                      size="sm" 
                      className="w-full"
                      onClick={handleAnnotation}
                    >
                      <PencilLine size={16} className="mr-2" /> Adicionar Anotação
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
              
              {/* Favorite button */}
              {onToggleFavorite && (
                <Button
                  variant={isFavorite ? "default" : "ghost"}
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite();
                  }}
                  title={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                >
                  {favoriteIcon}
                </Button>
              )}
              
              {/* Expand button */}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={toggleExpanded}
                title={isExpanded ? "Recolher" : "Expandir"}
              >
                {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </Button>
            </div>
          </div>
        </div>
        
        {/* Expandable content */}
        {isExpanded && (
          <CardContent className="pt-0 pb-4 px-4">
            {/* Article actions */}
            <ArticleActions 
              articleText={articleText}
              articleNumber={articleNumber}
              technicalExplanation={technicalExplanation}
              formalExplanation={formalExplanation}
              practicalExample={practicalExample}
              handleNarration={async (text) => {
                try {
                  setIsNarrating(true);
                  await TextToSpeechService.speak(text);
                  setIsNarrating(false);
                } catch (error) {
                  console.error('Error with text-to-speech:', error);
                  setIsNarrating(false);
                }
              }}
              isVisible={true}
              lawName={lawName}
            />
            
            {/* Details section with explanations */}
            {hasDetails && (
              <div className="mt-4">
                {showDetails ? (
                  <ArticleDetails 
                    articleNumber={articleNumber}
                    lawName={lawName}
                    technicalExplanation={technicalExplanation}
                    formalExplanation={formalExplanation}
                    practicalExample={practicalExample}
                    onClose={() => setShowDetails(false)}
                  />
                ) : (
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="mt-2"
                    onClick={toggleDetails}
                  >
                    Ver explicações e exemplos
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </motion.div>
  );
};

export default ArticleCard;


import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { 
  Volume, 
  VolumeX, 
  Info, 
  Book, 
  Bookmark,
  BookmarkCheck
} from 'lucide-react';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { motion } from 'framer-motion';

interface ArticleCardProps {
  article: {
    id: string;
    numero?: string;
    artigo: string;
    tecnica?: string;
    formal?: string;
    exemplo?: string;
  };
  isCurrentlyNarrating: boolean;
  onNarrate: () => void;
}

const ArticleCard: React.FC<ArticleCardProps> = ({
  article,
  isCurrentlyNarrating,
  onNarrate,
}) => {
  const [isFavorite, setIsFavorite] = useState(false);

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    // In a real implementation, this would save to user's favorites in the database
  };

  const hasAdditionalInfo = article.tecnica || article.formal || article.exemplo;

  return (
    <TooltipProvider>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="bg-card h-full flex flex-col">
          <CardContent className="p-4 flex-grow">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">
                {article.numero ? article.numero : 'Artigo'}
              </h3>
              <div className="flex space-x-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={onNarrate}
                    >
                      {isCurrentlyNarrating ? (
                        <VolumeX className="h-4 w-4" />
                      ) : (
                        <Volume className="h-4 w-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {isCurrentlyNarrating ? "Parar narração" : "Narrar artigo"}
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
            <p className={article.numero ? "text-left" : "text-center"}>
              {article.artigo}
            </p>
          </CardContent>
          <CardFooter className="p-3 border-t pt-3 flex justify-between">
            <Button 
              variant="ghost" 
              size="sm"
              className="text-xs"
              onClick={toggleFavorite}
            >
              {isFavorite ? (
                <BookmarkCheck className="h-4 w-4 mr-1" />
              ) : (
                <Bookmark className="h-4 w-4 mr-1" />
              )}
              {isFavorite ? 'Favoritado' : 'Favoritar'}
            </Button>
            
            {hasAdditionalInfo && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-xs"
                  >
                    <Info className="h-4 w-4 mr-1" />
                    Detalhes
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="w-80 p-4">
                  {article.tecnica && (
                    <div className="mb-2">
                      <h4 className="font-bold text-sm">Técnica:</h4>
                      <p className="text-xs">{article.tecnica}</p>
                    </div>
                  )}
                  {article.formal && (
                    <div className="mb-2">
                      <h4 className="font-bold text-sm">Formal:</h4>
                      <p className="text-xs">{article.formal}</p>
                    </div>
                  )}
                  {article.exemplo && (
                    <div>
                      <h4 className="font-bold text-sm">Exemplo:</h4>
                      <p className="text-xs">{article.exemplo}</p>
                    </div>
                  )}
                </TooltipContent>
              </Tooltip>
            )}
          </CardFooter>
        </Card>
      </motion.div>
    </TooltipProvider>
  );
};

export default ArticleCard;

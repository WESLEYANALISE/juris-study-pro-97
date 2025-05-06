
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { ArticleContent } from './ArticleContent';
import { cn } from '@/lib/utils';
import { ArticleActions } from './ArticleActions';
import { Headphones } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SoundscapeVisualization } from '@/components/ui/soundscape-theme';

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
  const [isHovered, setIsHovered] = useState(false);
  const [isNarrating, setIsNarrating] = useState(false);
  const hasDetails = technicalExplanation || formalExplanation || practicalExample;
  const isHeading = !articleNumber && (articleText?.includes('TÍTULO') || articleText?.includes('CAPÍTULO'));

  const toggleNarration = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsNarrating(!isNarrating);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Card 
        className={cn(
          "overflow-hidden transition-all duration-300 backdrop-blur-sm shadow-sm hover:shadow-md", 
          isHeading 
            ? "bg-gradient-to-br from-background/20 to-purple-950/5 border-primary/20"
            : "bg-gradient-to-b from-background/80 to-background/40",
          isNarrating && "border-primary/30 bg-primary/5",
          isFavorite ? "border-l-4 border-l-primary" : "border"
        )}
      >
        <CardContent className={cn("p-5 relative", isHeading ? "py-3" : "")}>
          {/* Audio indicator */}
          {isNarrating && (
            <motion.div 
              className="absolute top-2 right-2"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 15 }}
            >
              <div className="rounded-full bg-primary/10 p-1.5 border border-primary/20">
                <SoundscapeVisualization isPlaying={true} className="h-4 w-6" />
              </div>
            </motion.div>
          )}
          
          <div className="flex flex-col">
            <ArticleContent 
              articleNumber={articleNumber} 
              articleText={articleText} 
              fontSize={fontSize} 
              isHeading={isHeading}
              isPlaying={isNarrating}
            />
            
            {/* Audio Control Button */}
            {!isHeading && (
              <div className={cn(
                "flex justify-center mt-3 transition-opacity",
                isHovered || isNarrating ? "opacity-100" : "opacity-0"
              )}>
                <Button
                  variant={isNarrating ? "primary" : "secondary"}
                  size="sm"
                  onClick={toggleNarration}
                  className={cn("gap-2", isNarrating && "pulse-ring")}
                >
                  <Headphones className="h-4 w-4" />
                  {isNarrating ? "Pausar narração" : "Narrar artigo"}
                </Button>
              </div>
            )}
            
            {/* Article Actions - Show on hover or when active */}
            <ArticleActions 
              articleText={articleText} 
              articleNumber={articleNumber} 
              technicalExplanation={technicalExplanation} 
              formalExplanation={formalExplanation} 
              practicalExample={practicalExample} 
              isVisible={true} 
              lawName={lawName} 
            />
          </div>
        </CardContent>
        
        {/* Decorative bottom wave */}
        <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-primary/20 to-transparent">
          {isNarrating && (
            <motion.div 
              className="h-full bg-primary"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 10, repeat: Infinity }}
            />
          )}
        </div>
      </Card>
    </motion.div>
  );
};

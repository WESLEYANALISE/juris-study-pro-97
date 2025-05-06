
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { ArticleContent } from './ArticleContent';
import { cn } from '@/lib/utils';
import { ArticleActions } from './ArticleActions';

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

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -2 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Card 
        className={cn(
          "overflow-hidden transition-all duration-300 backdrop-blur-sm hover:shadow-lg hover:shadow-primary/5", 
          isHeading ? "bg-background/20 border-primary/20" : "bg-background/50",
          isFavorite ? "border-l-4 border-l-primary" : "border"
        )}
      >
        <CardContent className={cn("p-5", isHeading ? "py-3" : "")}>
          <div className="flex flex-col">
            <ArticleContent 
              articleNumber={articleNumber} 
              articleText={articleText} 
              fontSize={fontSize} 
              isHeading={isHeading} 
            />
            
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
      </Card>
    </motion.div>
  );
};

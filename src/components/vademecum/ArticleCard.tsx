
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/use-auth';
import { useIsMobile } from '@/hooks/use-mobile';
import { ArticleContent } from './article/ArticleContent';
import { ArticleActions } from './article/ArticleActions';
import { ArticleControls } from './article/ArticleControls';
import { useArticleFavorite } from '@/hooks/useArticleFavorite';

interface ArticleCardProps {
  lawName: string;
  articleNumber: string;
  articleText: string;
  technicalExplanation?: string;
  formalExplanation?: string;
  practicalExample?: string;
  fontSize: number;
}

export const ArticleCard = ({
  lawName,
  articleNumber,
  articleText,
  technicalExplanation,
  formalExplanation,
  practicalExample,
  fontSize,
}: ArticleCardProps) => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [isNarrating, setIsNarrating] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  const { isFavorite, isLoading, checkIsFavorite, toggleFavorite } = useArticleFavorite({
    lawName,
    articleNumber
  });

  // Check if article is a favorite when user is available
  useEffect(() => {
    if (user) {
      checkIsFavorite();
    }
  }, [user, checkIsFavorite]);

  // Determine if this is a heading (no article number)
  const isHeading = !articleNumber?.trim() && articleText?.trim();

  // Check if we have a valid article to display
  if (!articleNumber?.trim() && !articleText?.trim()) {
    return null; // Don't render invalid articles
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: isMobile ? 0.2 : 0.3 }}
      className="will-change-transform"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
    >
      <Card className={`
        p-4 md:p-6 space-y-4 
        transition-all duration-300 
        shadow-sm hover:shadow-md
        bg-gradient-to-br from-card/90 to-card/70 backdrop-blur-sm 
        border-primary/5 hover:border-primary/10
        ${isHeading ? 'border-l-0' : 'border-l-4 border-l-primary/30'}
      `}>
        <div className="flex justify-between items-start">
          <ArticleContent 
            articleNumber={articleNumber}
            articleText={articleText}
            fontSize={fontSize}
            isHeading={isHeading}
          />

          {!isHeading && user && (
            <ArticleControls
              articleText={articleText}
              isNarrating={isNarrating}
              setIsNarrating={setIsNarrating}
              isFavorite={isFavorite || false}
              setIsFavorite={() => toggleFavorite(articleText)}
              lawName={lawName}
              articleNumber={articleNumber}
              isLoading={isLoading}
              isVisible={isHovered || isMobile}
            />
          )}
        </div>

        {!isHeading && (
          <ArticleActions
            articleText={articleText}
            articleNumber={articleNumber}
            technicalExplanation={technicalExplanation}
            formalExplanation={formalExplanation}
            practicalExample={practicalExample}
            handleNarration={(text) => {
              setIsNarrating(true);
              return new Promise((resolve) => {
                setTimeout(() => {
                  setIsNarrating(false);
                  resolve();
                }, 1000);
              });
            }}
            isVisible={isHovered || isMobile}
            lawName={lawName}
          />
        )}
      </Card>
    </motion.div>
  );
};

export default ArticleCard;

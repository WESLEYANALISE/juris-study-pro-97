
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
  
  const { isFavorite, isLoading, checkIsFavorite, toggleFavorite } = useArticleFavorite({
    lawName,
    articleNumber
  });

  // For debugging
  useEffect(() => {
    console.log('ArticleCard props:', {
      lawName,
      articleNumber,
      articleTextLength: articleText?.length || 0,
      hasTechnicalExplanation: !!technicalExplanation,
      hasFormalExplanation: !!formalExplanation,
      hasPracticalExample: !!practicalExample,
      isFavoriteType: typeof isFavorite
    });
  }, [lawName, articleNumber, articleText, technicalExplanation, formalExplanation, practicalExample, isFavorite]);

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
      whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
    >
      <Card className="p-4 md:p-6 space-y-4 shadow-card hover:shadow-hover transition-all duration-300 bg-card/80 backdrop-blur-sm border-primary/10">
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
              isFavorite={!!isFavorite} 
              setIsFavorite={(value) => toggleFavorite(articleText)}
              lawName={lawName}
              articleNumber={articleNumber}
              isLoading={isLoading}
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
          />
        )}
      </Card>
    </motion.div>
  );
};

export default ArticleCard;

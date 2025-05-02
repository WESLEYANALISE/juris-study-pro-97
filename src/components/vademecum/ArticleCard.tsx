
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

  // Apply bold styling to "Parágrafo único" in article text
  const formattedArticleText = articleText?.replace(
    /(Parágrafo único\.|PARÁGRAFO ÚNICO\.)/g, 
    '<strong>$1</strong>'
  );

  return (
    <Card className={`
      p-4 md:p-5 space-y-4 
      shadow-sm
      bg-card
      border border-border hover:border-primary/20
      ${isHeading ? 'border-l-0' : 'border-l-4 border-l-primary/30'}
    `}>
      <div className="flex justify-between items-start">
        <ArticleContent 
          articleNumber={articleNumber}
          articleText={formattedArticleText || articleText}
          fontSize={fontSize}
          isHeading={isHeading}
        />

        {!isHeading && user && (
          <ArticleControls
            articleText={articleText}
            isNarrating={isNarrating}
            setIsNarrating={setIsNarrating}
            isFavorite={isFavorite === true} // Fix: Ensure this is boolean
            setIsFavorite={() => toggleFavorite(articleText)}
            lawName={lawName}
            articleNumber={articleNumber}
            isLoading={isLoading}
            isVisible={true}
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
          isVisible={true}
          lawName={lawName}
        />
      )}
    </Card>
  );
};

export default ArticleCard;

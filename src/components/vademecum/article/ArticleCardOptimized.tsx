
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ArticleActions } from './ArticleActions';

interface ArticleContentProps {
  articleNumber: string;
  articleText: string;
  fontSize?: number;
  isHeading?: boolean;
}

// Extracted ArticleContent as a separate memo component to prevent unnecessary re-renders
const ArticleContent = React.memo(({
  articleNumber,
  articleText,
  fontSize = 16,
  isHeading = false
}: ArticleContentProps) => {
  const headingStyles = isHeading ? "font-semibold text-primary" : "";
  
  return (
    <div className="mb-3">
      {articleNumber && (
        <h3 className={cn("text-lg font-semibold mb-1", headingStyles)} style={{ fontSize: `${fontSize}px` }}>
          Art. {articleNumber}
        </h3>
      )}
      <div 
        className={cn(
          "prose prose-gray dark:prose-invert max-w-none", 
          isHeading ? "font-medium" : ""
        )}
        style={{ fontSize: `${fontSize}px` }}
      >
        {articleText}
      </div>
    </div>
  );
});

ArticleContent.displayName = 'ArticleContent';

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

export const ArticleCardOptimized: React.FC<ArticleCardProps> = ({
  articleId,
  articleNumber,
  articleText,
  technicalExplanation,
  formalExplanation,
  practicalExample,
  lawName,
  isFavorite = false,
  fontSize = 16
}) => {
  const hasDetails = technicalExplanation || formalExplanation || practicalExample;
  const isHeading = !articleNumber && (articleText?.includes('TÍTULO') || articleText?.includes('CAPÍTULO'));

  return (
    <div className="transition-shadow duration-200 hover:shadow-md">
      <Card 
        className={cn(
          "overflow-hidden backdrop-blur-sm", 
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
            
            {/* Article Actions */}
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
    </div>
  );
};

export default React.memo(ArticleCardOptimized);

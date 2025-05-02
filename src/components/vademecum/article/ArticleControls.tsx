
import React from 'react';
import { BookmarkButton } from './BookmarkButton';
import { AnnotationButton } from './AnnotationButton';

interface ArticleControlsProps {
  articleText: string;
  isFavorite: boolean;
  setIsFavorite: (value: boolean) => void;
  isNarrating: boolean;
  setIsNarrating: (narrating: boolean) => void;
  lawName: string;
  articleNumber: string;
  isLoading: boolean;
  isVisible: boolean;
}

export const ArticleControls = ({
  articleText,
  isFavorite,
  setIsFavorite,
  isNarrating,
  setIsNarrating,
  lawName,
  articleNumber,
  isLoading,
  isVisible
}: ArticleControlsProps) => {
  // Don't render if not visible
  if (!isVisible) return null;

  return (
    <div className="flex items-center space-x-1">
      <BookmarkButton 
        isFavorite={isFavorite} 
        onToggle={() => setIsFavorite(!isFavorite)} 
        isLoading={isLoading}
      />
      <AnnotationButton 
        articleText={articleText}
        articleNumber={articleNumber}
        lawName={lawName}
      />
    </div>
  );
};

export default ArticleControls;

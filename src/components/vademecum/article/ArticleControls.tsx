
import React from 'react';
import { NarrationControls } from './NarrationControls';
import { BookmarkButton } from './BookmarkButton';

interface ArticleControlsProps {
  articleText: string;
  isNarrating: boolean;
  setIsNarrating: (isNarrating: boolean) => void;
  isFavorite: boolean;
  setIsFavorite: (isFavorite: boolean) => void;
  lawName: string;
  articleNumber: string;
  isLoading: boolean;
}

export const ArticleControls = ({
  articleText,
  isNarrating,
  setIsNarrating,
  isFavorite,
  setIsFavorite,
  lawName,
  articleNumber,
  isLoading
}: ArticleControlsProps) => {
  return (
    <div className="flex flex-col gap-2">
      <NarrationControls 
        text={articleText} 
        isNarrating={isNarrating} 
        setIsNarrating={setIsNarrating} 
      />
      <BookmarkButton 
        isFavorite={isFavorite} 
        setIsFavorite={setIsFavorite}
        lawName={lawName} 
        articleNumber={articleNumber} 
        articleText={articleText}
        isLoading={isLoading}
      />
    </div>
  );
};

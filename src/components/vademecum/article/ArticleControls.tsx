
import React from 'react';
import { NarrationControls } from './NarrationControls';
import { BookmarkButton } from './BookmarkButton';
import { motion, AnimatePresence } from 'framer-motion';

interface ArticleControlsProps {
  articleText: string;
  isNarrating: boolean;
  setIsNarrating: (isNarrating: boolean) => void;
  isFavorite: boolean;
  setIsFavorite: (isFavorite: boolean) => void;
  lawName: string;
  articleNumber: string;
  isLoading: boolean;
  isVisible: boolean;
}

export const ArticleControls = ({
  articleText,
  isNarrating,
  setIsNarrating,
  isFavorite,
  setIsFavorite,
  lawName,
  articleNumber,
  isLoading,
  isVisible
}: ArticleControlsProps) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          className="flex flex-col gap-2"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.2 }}
        >
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
        </motion.div>
      )}
    </AnimatePresence>
  );
};

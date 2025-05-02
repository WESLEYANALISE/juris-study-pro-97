
import React, { useState } from 'react';
import { NarrationControls } from './NarrationControls';
import { ArticleExplanation } from './ArticleExplanation';
import { PracticalExample } from './PracticalExample';

interface ArticleActionsProps {
  articleText: string;
  articleNumber: string;
  technicalExplanation?: string;
  formalExplanation?: string;
  practicalExample?: string;
  handleNarration: (text: string) => Promise<void>;
  isVisible: boolean;
  lawName: string;
}

export const ArticleActions = ({
  articleText,
  articleNumber,
  technicalExplanation,
  formalExplanation,
  practicalExample,
  handleNarration,
  isVisible,
  lawName,
}: ArticleActionsProps) => {
  const [isNarrating, setIsNarrating] = useState(false);

  const handleNarrationClick = async (text: string) => {
    setIsNarrating(true);
    try {
      await handleNarration(text);
    } finally {
      setIsNarrating(false);
    }
  };

  // Don't render if not visible
  if (!isVisible) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap pt-1">
      <NarrationControls 
        text={articleText} 
        isNarrating={isNarrating} 
        setIsNarrating={setIsNarrating}
        showLabel={true} 
      />
      
      {(technicalExplanation || formalExplanation) && (
        <ArticleExplanation
          technicalExplanation={technicalExplanation || ""}
          formalExplanation={formalExplanation || ""}
          onNarration={handleNarrationClick}
        />
      )}

      {practicalExample && (
        <PracticalExample
          example={practicalExample}
          onNarration={handleNarrationClick}
        />
      )}
    </div>
  );
};

export default ArticleActions;

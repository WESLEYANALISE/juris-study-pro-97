
import React, { useState, useEffect } from 'react';
import { ArticleActions } from './ArticleActions';
import { motion } from 'framer-motion';

interface ArticleProps {
  articleNumber: string;
  articleText: string;
  technicalExplanation?: string;
  formalExplanation?: string;
  practicalExample?: string;
  isOpen: boolean;
  onToggle: () => void;
  lawName: string;
}

export function Article({
  articleNumber,
  articleText,
  technicalExplanation,
  formalExplanation,
  practicalExample,
  isOpen,
  onToggle,
  lawName
}: ArticleProps) {
  const [showActions, setShowActions] = useState(false);
  
  // Reset show actions when article closes
  useEffect(() => {
    if (!isOpen) {
      setShowActions(false);
    }
  }, [isOpen]);
  
  // Format article text by preserving line breaks
  const formatArticleText = (text: string) => {
    if (!text) return null;
    return text.split('\n').map((line, index) => (
      <p key={index} className="mb-2">{line}</p>
    ));
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-card shadow-sm border rounded-lg overflow-hidden"
    >
      {/* Article header */}
      <div
        onClick={onToggle}
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/30 transition-colors"
      >
        <h3 className="font-semibold">
          {articleNumber ? `Artigo ${articleNumber}` : 'Conteúdo'}
        </h3>
        <div className="flex items-center gap-2">
          <div className={`h-6 w-6 rounded-full flex items-center justify-center bg-primary/10 transition-transform ${isOpen ? 'rotate-180' : ''}`}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-primary"
            >
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>
        </div>
      </div>
      
      {/* Article content */}
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="px-4 pb-4"
        >
          <div 
            className="relative vademecum-article-content"
            id={`article-content-${articleNumber}`}
            onMouseEnter={() => setShowActions(true)}
            onMouseLeave={() => setShowActions(false)}
          >
            {formatArticleText(articleText)}
          </div>
          
          {/* Article actions */}
          <ArticleActions
            articleText={articleText}
            articleNumber={articleNumber}
            technicalExplanation={technicalExplanation}
            formalExplanation={formalExplanation}
            practicalExample={practicalExample}
            isVisible={showActions || !!articleNumber}
            lawName={lawName}
          />
        </motion.div>
      )}
    </motion.div>
  );
}

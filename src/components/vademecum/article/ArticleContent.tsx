
import React from 'react';
import ReactMarkdown from 'react-markdown';
import { motion } from 'framer-motion';

interface ArticleContentProps {
  articleNumber: string;
  articleText: string;
  fontSize: number;
  isHeading: boolean;
}

export const ArticleContent: React.FC<ArticleContentProps> = ({
  articleNumber,
  articleText,
  fontSize,
  isHeading
}) => {
  // Format paragraphs, bold "Parágrafo único", and handle highlights
  const formattedText = articleText
    ? articleText
        .replace(/(Parágrafo único\.|PARÁGRAFO ÚNICO\.)/g, '**$1**')
        .replace(/(\n\s*\n)/g, '\n\n')
    : '';

  return (
    <motion.div 
      className={`flex flex-col ${isHeading ? "w-full" : ""}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {articleNumber?.trim() ? (
        <h3 className="text-lg font-semibold bg-primary/10 px-3 py-1 rounded-lg inline-block shadow-sm">
          Art. {articleNumber}
        </h3>
      ) : null}
      <div 
        id={`article-content-${articleNumber}`}
        style={{ fontSize: `${fontSize}px` }} 
        className={`
          mt-3 whitespace-pre-line px-1 py-3 ml-0 
          ${isHeading 
            ? "text-center w-full font-semibold text-primary" 
            : "border-l-0 pl-3"}
        `}
      >
        {formattedText ? (
          <ReactMarkdown 
            className="prose dark:prose-invert max-w-none prose-p:my-3 prose-headings:my-4 article-content"
          >
            {formattedText}
          </ReactMarkdown>
        ) : (
          <p className="text-muted-foreground italic">Texto do artigo não disponível</p>
        )}
      </div>
    </motion.div>
  );
};

export default ArticleContent;

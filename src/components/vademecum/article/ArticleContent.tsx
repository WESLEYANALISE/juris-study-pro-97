
import React from 'react';
import ReactMarkdown from 'react-markdown';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

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
      className={cn("flex flex-col", isHeading ? "w-full" : "")}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {articleNumber?.trim() ? (
        <motion.div 
          className="flex items-center gap-2 mb-3"
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <h3 className="text-base font-medium bg-primary/10 px-4 py-1.5 rounded-md inline-block border border-primary/20 backdrop-blur-sm">
            Art. {articleNumber}
          </h3>
        </motion.div>
      ) : null}
      <motion.div 
        id={`article-content-${articleNumber}`}
        style={{ fontSize: `${fontSize}px` }} 
        className={cn(
          "prose-sm prose-zinc dark:prose-invert max-w-none",
          "mt-1 whitespace-pre-line px-1 py-2 ml-0 vademecum-content", 
          isHeading 
            ? "text-center w-full font-semibold text-gradient-primary" 
            : "border-l-0 pl-3"
        )}
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
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
      </motion.div>
    </motion.div>
  );
};

export default ArticleContent;

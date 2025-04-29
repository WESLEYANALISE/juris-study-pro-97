
import React from 'react';
import ReactMarkdown from 'react-markdown';

interface ArticleContentProps {
  articleNumber: string;
  articleText: string;
  fontSize: number;
  isHeading: boolean;
}

export const ArticleContent = ({
  articleNumber,
  articleText,
  fontSize,
  isHeading
}: ArticleContentProps) => {
  return (
    <div className={`flex flex-col ${isHeading ? "w-full" : ""}`}>
      {articleNumber?.trim() ? (
        <h3 className="text-lg font-semibold bg-primary/10 px-3 py-1 rounded-lg inline-block shadow-sm">
          Art. {articleNumber}
        </h3>
      ) : null}
      <div 
        style={{ fontSize: `${fontSize}px` }} 
        className={`
          mt-2 whitespace-pre-line px-1 py-3 ml-0 
          ${isHeading 
            ? "text-center w-full font-semibold" 
            : "border-l-2 border-primary/30 pl-3 bg-gradient-to-r from-transparent to-background/20"}
        `}
      >
        <ReactMarkdown className="prose dark:prose-invert max-w-none">{articleText || ''}</ReactMarkdown>
      </div>
    </div>
  );
};

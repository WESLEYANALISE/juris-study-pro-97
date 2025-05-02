
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
  // Format paragraphs and bold "Parágrafo único"
  const formattedText = articleText
    ? articleText
        .replace(/(Parágrafo único\.|PARÁGRAFO ÚNICO\.)/g, '**$1**')
        .replace(/(\n\s*\n)/g, '\n\n')
    : '';

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
          mt-3 whitespace-pre-line px-1 py-3 ml-0 
          ${isHeading 
            ? "text-center w-full font-semibold text-primary" 
            : "border-l-0 pl-3"}
        `}
      >
        <ReactMarkdown 
          className="prose dark:prose-invert max-w-none prose-p:my-3 prose-headings:my-4"
        >
          {formattedText}
        </ReactMarkdown>
      </div>
    </div>
  );
};

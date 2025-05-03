
import React from 'react';
import { cn } from '@/lib/utils';

interface ArticleContentProps {
  articleNumber: string;
  articleText: string;
  fontSize?: number;
  isHeading?: boolean;
}

export const ArticleContent: React.FC<ArticleContentProps> = ({
  articleNumber,
  articleText,
  fontSize = 16,
  isHeading = false
}) => {
  return (
    <div className="flex-1">
      {articleNumber && (
        <h3 
          className={cn(
            "font-semibold mb-2",
            isHeading ? "text-xl" : "text-lg"
          )}
          style={{ fontSize: `${fontSize}px` }}
        >
          Art. {articleNumber}
        </h3>
      )}
      <p 
        className={cn(
          "text-muted-foreground dark:text-gray-300",
          isHeading ? "font-semibold" : ""
        )}
        style={{ fontSize: `${fontSize}px` }}
      >
        {articleText}
      </p>
    </div>
  );
};

export default ArticleContent;


import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import ArticleCard from "@/components/vademecum/ArticleCard";
import { useIsMobile } from "@/hooks/use-mobile";

interface VadeMecumArticleListProps {
  isLoading: boolean;
  visibleArticles: any[];
  filteredArticles: any[];
  visibleBatch: number;
  tableName: string;
  fontSize: number;
  loadMoreRef: (node?: Element | null) => void;
}

export function VadeMecumArticleList({
  isLoading,
  visibleArticles,
  filteredArticles,
  visibleBatch,
  tableName,
  fontSize,
  loadMoreRef
}: VadeMecumArticleListProps) {
  const isMobile = useIsMobile();

  // Helper function to get the correct article properties regardless of database column naming
  const getArticleProps = (article: any) => {
    return {
      articleNumber: article.numero || article.article_number || '',
      articleText: article.artigo || article.article_text || '',
      technicalExplanation: article.tecnica || article.technical_explanation,
      formalExplanation: article.formal || article.formal_explanation,
      practicalExample: article.exemplo || article.practical_example
    };
  };

  return (
    <div className="space-y-4 md:space-y-5 px-[5px]">
      {isLoading ? (
        // Loading skeletons
        Array.from({ length: isMobile ? 2 : 3 }).map((_, i) => (
          <Skeleton key={`skeleton-${i}`} className="h-32" />
        ))
      ) : filteredArticles.length === 0 ? (
        // No results message
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            Nenhum artigo encontrado com os critérios de busca.
          </p>
        </div>
      ) : (
        // Article cards
        visibleArticles.map((article, index) => {
          const {
            articleNumber,
            articleText,
            technicalExplanation,
            formalExplanation,
            practicalExample
          } = getArticleProps(article);
          
          return (
            <div key={article.id || `article-${index}`}>
              <ArticleCard 
                lawName={tableName || ''} 
                articleNumber={articleNumber} 
                articleText={articleText} 
                technicalExplanation={technicalExplanation} 
                formalExplanation={formalExplanation} 
                practicalExample={practicalExample} 
                fontSize={fontSize} 
              />
            </div>
          );
        })
      )}
      
      {!isLoading && filteredArticles.length > visibleBatch && (
        <div ref={loadMoreRef} className="py-4 flex justify-center">
          <Skeleton className="h-8 w-32" />
        </div>
      )}
    </div>
  );
}

export default VadeMecumArticleList;

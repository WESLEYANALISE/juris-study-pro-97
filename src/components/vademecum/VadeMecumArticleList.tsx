
import React, { memo } from 'react';
import { ArticleCard } from './article/ArticleCard';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { SupabaseArticle } from '@/types/supabase';

interface VadeMecumArticleListProps {
  isLoading: boolean;
  data: SupabaseArticle[];
  filter: string;
  tableName: string;
  visibleArticles: SupabaseArticle[];
  loadMoreRef: (node: HTMLDivElement | null) => void;
}

// Using React.memo to prevent unnecessary re-renders
export const VadeMecumArticleList = memo(({
  isLoading,
  data,
  filter,
  tableName,
  visibleArticles,
  loadMoreRef
}: VadeMecumArticleListProps) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <LoadingSpinner className="h-8 w-8 text-primary" />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="p-8 text-center rounded-xl border border-dashed border-muted-foreground/30 bg-muted/20">
        <p className="text-muted-foreground">Nenhum artigo encontrado.</p>
        {filter && (
          <p className="text-sm text-muted-foreground mt-2">
            Tente ajustar seu termo de busca ou selecione outra lei.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        {visibleArticles.map((article, index) => (
          <ArticleCard
            key={`${article.id}-${index}`}
            articleId={article.id.toString()}
            articleNumber={article.numero || ''}
            articleText={article.artigo || ''}
            technicalExplanation={article.tecnica || ''}
            formalExplanation={article.formal || ''}
            practicalExample={article.exemplo || ''}
            lawName={tableName}
          />
        ))}
      </div>

      {/* Infinite scroll loading indicator */}
      {visibleArticles.length < data.length && (
        <div 
          ref={loadMoreRef}
          className="py-4 flex justify-center"
        >
          <LoadingSpinner className="h-6 w-6 text-primary/50" />
        </div>
      )}
    </div>
  );
});

VadeMecumArticleList.displayName = "VadeMecumArticleList";

export default VadeMecumArticleList;


import React, { useState, useEffect } from 'react';
import { Article } from '@/components/vademecum/article/Article';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { motion } from 'framer-motion';

interface VadeMecumArticleListProps {
  data: any[];
  filter: string;
  isLoading: boolean;
  tableName: string;
  visibleArticles: any[];
  loadMoreRef: (node: HTMLDivElement | null) => void;
}

export function VadeMecumArticleList({
  data,
  filter,
  isLoading,
  tableName,
  visibleArticles,
  loadMoreRef
}: VadeMecumArticleListProps) {
  const [activeArticle, setActiveArticle] = useState<string | null>(null);
  
  useEffect(() => {
    // Reset active article when filter changes
    setActiveArticle(null);
  }, [filter]);
  
  const toggleArticle = (articleNumber: string) => {
    setActiveArticle(activeArticle === articleNumber ? null : articleNumber);
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px] py-12">
        <div className="text-center">
          <LoadingSpinner className="h-8 w-8 mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando artigos...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Show filter message if filtering */}
      {filter && (
        <div className="bg-muted/50 px-4 py-3 rounded-lg flex items-center justify-between">
          <p className="text-sm">
            Mostrando {data.length} resultado{data.length !== 1 ? 's' : ''} para "{filter}"
          </p>
          {data.length > 0 && (
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="text-xs text-primary hover:underline"
            >
              Voltar ao topo
            </button>
          )}
        </div>
      )}
      
      {/* Articles list */}
      <motion.div 
        className="space-y-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {visibleArticles.map((article, index) => (
          <Article
            key={`${article.id}-${index}`}
            articleNumber={article.numero ?? ""}
            articleText={article.artigo ?? ""}
            technicalExplanation={article.tecnica}
            formalExplanation={article.formal}
            practicalExample={article.exemplo}
            isOpen={activeArticle === article.numero}
            onToggle={() => toggleArticle(article.numero)}
            lawName={tableName}
          />
        ))}
        
        {/* Load more trigger element */}
        {data.length > visibleArticles.length && (
          <div ref={loadMoreRef} className="h-10 flex justify-center items-center py-8">
            <LoadingSpinner className="h-6 w-6" />
          </div>
        )}
      </motion.div>
    </div>
  );
}

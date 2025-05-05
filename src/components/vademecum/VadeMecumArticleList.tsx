
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Article } from '@/components/vademecum/article/Article';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

interface VadeMecumArticleListProps {
  data: any[];
  filter: string;
  isLoading: boolean;
  tableName: string;
  visibleArticles: any[];
  loadMoreRef: (node: HTMLDivElement | null) => void;
}

// Virtualized article list with optimized rendering
export function VadeMecumArticleList({
  data,
  filter,
  isLoading,
  tableName,
  visibleArticles,
  loadMoreRef
}: VadeMecumArticleListProps) {
  const [activeArticle, setActiveArticle] = useState<string | null>(null);
  const [initialRender, setInitialRender] = useState(true);
  const listRef = useRef<HTMLDivElement>(null);
  
  // Use viewport tracking to optimize rendering
  const { ref: viewportRef, inView } = useInView({
    threshold: 0.1,
    triggerOnce: false,
  });
  
  // Reset active article when filter changes
  useEffect(() => {
    setActiveArticle(null);
  }, [filter]);
  
  // After initial render, mark complete to enable animations
  useEffect(() => {
    const timer = setTimeout(() => {
      setInitialRender(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Optimize toggle for better performance
  const toggleArticle = useCallback((articleNumber: string) => {
    setActiveArticle(prev => prev === articleNumber ? null : articleNumber);
  }, []);
  
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
    <div className="space-y-6" ref={listRef}>
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
      
      {/* Articles list - optimized with conditional motion */}
      <div 
        className="space-y-4"
        ref={viewportRef}
      >
        {visibleArticles.map((article, index) => (
          <React.Fragment key={`${article.id}-${index}`}>
            {/* Only apply motion to visible articles after initial render */}
            {initialRender ? (
              <Article
                articleNumber={article.numero ?? ""}
                articleText={article.artigo ?? ""}
                technicalExplanation={article.tecnica}
                formalExplanation={article.formal}
                practicalExample={article.exemplo}
                isOpen={activeArticle === article.numero}
                onToggle={() => toggleArticle(article.numero)}
                lawName={tableName}
              />
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: Math.min(index * 0.03, 0.5) }}
              >
                <Article
                  articleNumber={article.numero ?? ""}
                  articleText={article.artigo ?? ""}
                  technicalExplanation={article.tecnica}
                  formalExplanation={article.formal}
                  practicalExample={article.exemplo}
                  isOpen={activeArticle === article.numero}
                  onToggle={() => toggleArticle(article.numero)}
                  lawName={tableName}
                />
              </motion.div>
            )}
          </React.Fragment>
        ))}
        
        {/* Load more trigger element */}
        {data.length > visibleArticles.length && (
          <div ref={loadMoreRef} className="h-10 flex justify-center items-center py-8">
            <LoadingSpinner className="h-6 w-6" />
          </div>
        )}
      </div>
    </div>
  );
}

// Use React.memo to prevent unnecessary re-renders
export default React.memo(VadeMecumArticleList);

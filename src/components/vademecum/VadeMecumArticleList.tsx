
import React from 'react';
import { ArticleCard } from './article/ArticleCard';
import { motion, AnimatePresence } from 'framer-motion';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface VadeMecumArticleListProps {
  isLoading: boolean;
  data: any[];
  filter: string;
  tableName: string;
  visibleArticles: any[];
  loadMoreRef: (node: HTMLDivElement | null) => void;
}

export const VadeMecumArticleList: React.FC<VadeMecumArticleListProps> = ({
  isLoading,
  data,
  filter,
  tableName,
  visibleArticles,
  loadMoreRef
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <LoadingSpinner className="h-8 w-8 text-primary" />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        className="p-8 text-center rounded-xl border border-dashed border-muted-foreground/30 bg-muted/20"
      >
        <p className="text-muted-foreground">Nenhum artigo encontrado.</p>
        {filter && (
          <p className="text-sm text-muted-foreground mt-2">
            Tente ajustar seu termo de busca ou selecione outra lei.
          </p>
        )}
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      <AnimatePresence mode="wait">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="space-y-4">
            {visibleArticles.map((article, index) => (
              <motion.div
                key={`${article.id}-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index < 10 ? index * 0.05 : 0 }}
              >
                <ArticleCard
                  articleId={article.id.toString()}
                  articleNumber={article.numero || ''}
                  articleText={article.artigo || ''}
                  technicalExplanation={article.tecnica || ''}
                  formalExplanation={article.formal || ''}
                  practicalExample={article.exemplo || ''}
                  lawName={tableName}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Infinite scroll loading indicator */}
      {visibleArticles.length < data.length && (
        <div 
          ref={loadMoreRef}
          className="py-8 flex justify-center"
        >
          <LoadingSpinner className="h-6 w-6 text-primary/50" />
        </div>
      )}
    </div>
  );
};

export default VadeMecumArticleList;


import React from "react";
import { AnimatePresence, motion } from "framer-motion";
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
  setFontSize: (size: number) => void;
  loadMoreRef: (node?: Element | null) => void;
}

export function VadeMecumArticleList({
  isLoading,
  visibleArticles,
  filteredArticles,
  visibleBatch,
  tableName,
  fontSize,
  setFontSize,
  loadMoreRef
}: VadeMecumArticleListProps) {
  const isMobile = useIsMobile();
  
  return (
    <div className="space-y-4 md:space-y-6">
      <AnimatePresence>
        {isLoading ? (
          Array.from({ length: isMobile ? 2 : 3 }).map((_, i) => (
            <motion.div
              key={`skeleton-${i}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2, delay: i * 0.05 }}
            >
              <Skeleton className="h-32" />
            </motion.div>
          ))
        ) : filteredArticles.length === 0 ? (
          <motion.div 
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <p className="text-muted-foreground">
              Nenhum artigo encontrado com os critérios de busca.
            </p>
          </motion.div>
        ) : (
          visibleArticles.map((article) => (
            <ArticleCard
              key={article.id}
              lawName={tableName || ''}
              articleNumber={article.numero || article.article_number || ''} 
              articleText={article.artigo || article.article_text || ''}
              technicalExplanation={article.tecnica || article.technical_explanation}
              formalExplanation={article.formal || article.formal_explanation}
              practicalExample={article.exemplo || article.practical_example}
              fontSize={fontSize}
              onFontSizeChange={setFontSize}
            />
          ))
        )}
      </AnimatePresence>
      
      {!isLoading && filteredArticles.length > visibleBatch && (
        <div ref={loadMoreRef} className="py-4 flex justify-center">
          <Skeleton className="h-8 w-32" />
        </div>
      )}
    </div>
  );
}

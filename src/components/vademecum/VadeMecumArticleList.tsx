
import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import ArticleCard from "@/components/vademecum/ArticleCard";

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
  return (
    <div className="space-y-6">
      <AnimatePresence>
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <motion.div
              key={`skeleton-${i}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: i * 0.1 }}
            >
              <Skeleton className="h-32" />
            </motion.div>
          ))
        ) : filteredArticles.length === 0 ? (
          <motion.div 
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
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
              articleNumber={article.numero || ''}
              articleText={article.artigo}
              technicalExplanation={article.tecnica}
              formalExplanation={article.formal}
              practicalExample={article.exemplo}
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

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

  // Custom animation variants for staggered entry
  const containerVariants = {
    hidden: {
      opacity: 0
    },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 20
    },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3
      }
    }
  };
  return <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-4 md:space-y-6 px-[6px]">
      <AnimatePresence>
        {isLoading ? Array.from({
        length: isMobile ? 2 : 3
      }).map((_, i) => <motion.div key={`skeleton-${i}`} variants={itemVariants}>
              <Skeleton className="h-32" />
            </motion.div>) : filteredArticles.length === 0 ? <motion.div className="text-center py-12" initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} transition={{
        duration: 0.3
      }}>
            <p className="text-muted-foreground">
              Nenhum artigo encontrado com os critérios de busca.
            </p>
          </motion.div> : visibleArticles.map((article, index) => {
        const {
          articleNumber,
          articleText,
          technicalExplanation,
          formalExplanation,
          practicalExample
        } = getArticleProps(article);
        return <motion.div key={article.id || `article-${index}`} variants={itemVariants}>
                <ArticleCard lawName={tableName || ''} articleNumber={articleNumber} articleText={articleText} technicalExplanation={technicalExplanation} formalExplanation={formalExplanation} practicalExample={practicalExample} fontSize={fontSize} />
              </motion.div>;
      })}
      </AnimatePresence>
      
      {!isLoading && filteredArticles.length > visibleBatch && <div ref={loadMoreRef} className="py-4 flex justify-center">
          <motion.div initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} transition={{
        delay: 0.5
      }}>
            <Skeleton className="h-8 w-32" />
          </motion.div>
        </div>}
    </motion.div>;
}
export default VadeMecumArticleList;
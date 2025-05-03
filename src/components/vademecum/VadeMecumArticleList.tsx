
import React from 'react';
import { motion } from 'framer-motion';
import { ArticleCard } from './article/ArticleCard';
import EmptyState from './EmptyState';
import { LoadingArticleCard } from './LoadingArticleCard';
import { BookmarkPlus } from 'lucide-react';
import { useVadeMecumFavorites } from '@/hooks/useVadeMecumFavorites';

interface VadeMecumArticleListProps {
  isLoading: boolean;
  data: any[];
  filter: string;
  tableName: string;
  visibleArticles: any[];
  loadMoreRef: ((node: HTMLDivElement | null) => void);
}

export const VadeMecumArticleList: React.FC<VadeMecumArticleListProps> = ({
  isLoading,
  data,
  filter,
  tableName,
  visibleArticles,
  loadMoreRef
}) => {
  const { toggleFavorite, isFavorite } = useVadeMecumFavorites();

  // Animation variants for staggered article appearance
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        staggerChildren: 0.05 
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 250
      }
    }
  };

  // Return loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <LoadingArticleCard key={`loading-${index}`} />
        ))}
      </div>
    );
  }
  
  // Return empty state if no articles match filter
  if (data.length === 0) {
    return <EmptyState filter={filter} />;
  }
  
  // No articles visible yet
  if (visibleArticles.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <p className="text-muted-foreground">Nenhum artigo encontrado</p>
        </div>
      </div>
    );
  }

  // Debug: Log the first few articles to see their structure
  console.log("First few articles:", visibleArticles.slice(0, 3));

  return (
    <motion.div 
      className="space-y-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {visibleArticles.map(article => {
        if (!article) {
          console.warn("Received undefined or null article");
          return null;
        }
        
        // Ensure all required properties exist for display
        const articleNumber = article.numero || '';
        const articleText = article.artigo || '';
        const articleId = article.id ? article.id.toString() : '';
        const technicalExplanation = article.tecnica || '';
        const formalExplanation = article.formal || '';
        const practicalExample = article.exemplo || '';
        
        // Check if article has either a number or text to display
        if (!articleText && !articleNumber) {
          console.warn("Skipping article without text or number:", article);
          return null;
        }
        
        // Check if the article is a favorite
        const isFavorited = isFavorite(articleNumber, tableName);
        
        return (
          <motion.div 
            key={articleId} 
            variants={itemVariants}
          >
            <ArticleCard
              articleId={articleId}
              articleNumber={articleNumber}
              articleText={articleText}
              technicalExplanation={technicalExplanation}
              formalExplanation={formalExplanation}
              practicalExample={practicalExample}
              lawName={tableName}
              isFavorite={isFavorited}
              onToggleFavorite={() => toggleFavorite({
                law_name: tableName,
                article_id: articleId,
                article_number: articleNumber,
                article_text: articleText
              })}
              favoriteIcon={<BookmarkPlus size={18} />}
            />
          </motion.div>
        );
      })}
      
      {/* Invisible div for infinite scroll observer */}
      {data.length > visibleArticles.length && (
        <div ref={loadMoreRef} className="h-4 w-full" />
      )}
    </motion.div>
  );
};

export default VadeMecumArticleList;


import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useInView } from "react-intersection-observer";
import { useIsMobile } from "@/hooks/use-mobile";
import { FloatingControls } from "@/components/vademecum/FloatingControls";
import { useVadeMecumDisplay } from "@/hooks/useVadeMecumDisplay";
import { useVadeMecumSearch } from "@/hooks/useVadeMecumSearch";
import { VadeMecumSidebar } from "@/components/vademecum/VadeMecumSidebar";
import { useVadeMecumFavorites } from "@/hooks/useVadeMecumFavorites";
import { useAuth } from "@/hooks/use-auth";
import { VadeMecumArticleList } from "@/components/vademecum/VadeMecumArticleList";
import { VadeMecumHeader } from "@/components/vademecum/VadeMecumHeader";
import { VadeMecumError } from "@/components/vademecum/VadeMecumError";
import { useVadeMecumArticles } from "@/hooks/useVadeMecumArticles";
import { JuridicalBackground } from "@/components/ui/juridical-background";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Container } from "@/components/ui/container";
import { BookOpen } from "lucide-react"; // Updated import name from BookOpenIcon to BookOpen

// Define a type for the supported background variants
type VadeMecumBackgroundVariant = "scales" | "books" | "constitution";

const VadeMecumViewer = () => {
  const navigate = useNavigate();
  const { lawId } = useParams<{ lawId: string }>();
  
  // Initial batch size increased for better initial load
  const [visibleBatch, setVisibleBatch] = useState(30);
  const [recentHistory, setRecentHistory] = useState<any[]>([]);
  const { searchQuery, setSearchQuery } = useVadeMecumSearch();
  const { favorites, loadHistory } = useVadeMecumFavorites();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  
  const {
    fontSize,
    showBackToTop,
    scrollToTop,
    increaseFontSize,
    decreaseFontSize
  } = useVadeMecumDisplay();

  // Cache for the articles to improve performance
  const [articlesCache, setArticlesCache] = useState<Record<string, any[]>>({});

  // Use react-intersection-observer for "infinite scroll" detection
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: false
  });

  // Connect the intersection observer ref with our React ref
  const setRefs = useCallback((node: HTMLDivElement | null) => {
    // Call the ref function from useInView
    ref(node);
  }, [ref]);
  
  const {
    filteredArticles,
    loading,
    error,
    loadArticles,
    decodedLawName,
    tableName
  } = useVadeMecumArticles(searchQuery);

  // Memorize the filtered articles to avoid unnecessary re-renders
  const cachedArticles = useMemo(() => {
    if (!filteredArticles.length || !tableName) return filteredArticles;

    // Store in cache for future use
    if (filteredArticles.length > 0 && tableName) {
      setArticlesCache(prev => ({
        ...prev,
        [tableName]: filteredArticles
      }));
    }
    return filteredArticles;
  }, [filteredArticles, tableName]);

  // Load view history
  useEffect(() => {
    if (user) {
      loadHistory().then(history => setRecentHistory(history || []));
    }
  }, [user, loadHistory]);

  // Calculate articles visible based on current batch
  const visibleArticles = useMemo(() => {
    const articles = cachedArticles.slice(0, visibleBatch);
    return articles;
  }, [cachedArticles, visibleBatch]);

  // Try loading from cache first, then fetch from API
  useEffect(() => {
    if (lawId && articlesCache[lawId]?.length > 0) {
      // No need to fetch, already cached
      return;
    }
    
    loadArticles();
  }, [lawId, loadArticles, articlesCache]);

  // Effect for loading more articles when user scrolls to bottom
  useEffect(() => {
    if (inView && cachedArticles.length > visibleBatch) {
      // Improved batch size - load more articles at once
      const batchSize = isMobile ? 20 : 40;
      setVisibleBatch(prev => prev + batchSize);
    }
  }, [inView, cachedArticles.length, visibleBatch, isMobile]);

  // Select the appropriate background based on law type
  const getBgVariant = useMemo((): VadeMecumBackgroundVariant => {
    if (!tableName) return "books";
    const lawNameLower = tableName.toLowerCase();
    if (lawNameLower.includes('constituição') || lawNameLower.includes('constituicao')) return "constitution";
    if (lawNameLower.includes('código') || lawNameLower.includes('codigo')) return "constitution";
    // Using scales for all other types
    return "scales";
  }, [tableName]);

  // Navigate to favorites page
  const goToFavorites = useCallback(() => {
    navigate('/vademecum/favoritos');
  }, [navigate]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5, staggerChildren: 0.15 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh] py-12">
        <div className="text-center space-y-4">
          <LoadingSpinner className="h-10 w-10 mx-auto text-primary" />
          <p className="text-muted-foreground animate-pulse">Carregando artigos...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return <VadeMecumError error={error} onRetry={() => loadArticles()} />;
  }

  return (
    <JuridicalBackground variant={getBgVariant} opacity={0.03}>
      <Container size="xl" className="p-4 py-6">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-4 gap-8"
        >
          {/* For mobile, display sidebar at top when on smaller screens */}
          {isMobile && (
            <motion.div variants={itemVariants} className="lg:col-span-1 mb-2">
              <VadeMecumSidebar favorites={favorites} recentHistory={recentHistory} />
            </motion.div>
          )}
          
          <motion.div variants={itemVariants} className="lg:col-span-3 px-[10px]">
            <VadeMecumHeader 
              title={decodedLawName} 
              searchQuery={searchQuery} 
              setSearchQuery={setSearchQuery} 
              onReload={() => loadArticles()} 
            />

            {cachedArticles.length === 0 && !loading ? (
              <motion.div 
                variants={itemVariants}
                className="text-center py-12 bg-background/30 backdrop-blur-sm rounded-lg border border-primary/20"
              >
                <BookOpen className="h-16 w-16 mx-auto text-muted-foreground opacity-30 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Nenhum artigo encontrado</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Não encontramos nenhum artigo que corresponda aos seus critérios de busca.
                </p>
              </motion.div>
            ) : (
              <VadeMecumArticleList 
                isLoading={loading} 
                data={cachedArticles} 
                filter={searchQuery} 
                tableName={tableName} 
                visibleArticles={visibleArticles} 
                loadMoreRef={setRefs} 
              />
            )}
          </motion.div>
          
          {/* Only show sidebar in this position on desktop */}
          {!isMobile && (
            <motion.div variants={itemVariants} className="lg:col-span-1">
              <VadeMecumSidebar favorites={favorites} recentHistory={recentHistory} />
            </motion.div>
          )}
        </motion.div>

        {/* Bottom floating controls for font size and back to top */}
        <FloatingControls 
          fontSize={fontSize} 
          increaseFontSize={increaseFontSize} 
          decreaseFontSize={decreaseFontSize} 
          showBackToTop={showBackToTop} 
          scrollToTop={scrollToTop} 
        />
      </Container>
    </JuridicalBackground>
  );
};

export default VadeMecumViewer;

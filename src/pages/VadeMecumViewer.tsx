
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

  // Create a ref for the loadMore element
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Use react-intersection-observer para detecção de "infinite scroll"
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: false
  });

  // Connect the intersection observer ref with our React ref
  const setRefs = useCallback(
    (node: HTMLDivElement | null) => {
      // Update the loadMoreRef
      if (node) {
        loadMoreRef.current = node;
      }
      
      // Call the ref function from useInView
      ref(node);
    },
    [ref]
  );
  
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
  const visibleArticles = useMemo(() => 
    cachedArticles.slice(0, visibleBatch)
  , [cachedArticles, visibleBatch]);

  // Try loading from cache first, then fetch from API
  useEffect(() => {
    if (lawId && articlesCache[lawId]?.length > 0) {
      // No need to fetch, already cached
      return;
    }
    loadArticles();
  }, [lawId, loadArticles]);

  // Effect for loading more articles when user scrolls to bottom
  useEffect(() => {
    if (inView && cachedArticles.length > visibleBatch) {
      // Improved batch size - load more articles at once
      const batchSize = isMobile ? 20 : 40;
      setVisibleBatch(prev => prev + batchSize);
    }
  }, [inView, cachedArticles.length, visibleBatch, isMobile]);

  // Select the appropriate background based on law type
  const getBgVariant = useMemo(() => {
    if (!tableName) return "books";
    
    const lawNameLower = tableName.toLowerCase();
    if (lawNameLower.includes('constituição') || lawNameLower.includes('constituicao')) return "constitution";
    if (lawNameLower.includes('código') || lawNameLower.includes('codigo')) return "constitution";
    if (lawNameLower.includes('estatuto')) return "courthouse";
    if (lawNameLower.includes('lei')) return "scales";
    
    return "books";
  }, [tableName]);

  // Navigate to favorites page
  const goToFavorites = useCallback(() => {
    navigate('/vademecum/favoritos');
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px] py-12">
        <div className="text-center">
          <LoadingSpinner className="h-8 w-8 mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando artigos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return <VadeMecumError error={error} onRetry={() => loadArticles()} />;
  }

  return (
    <JuridicalBackground variant={getBgVariant} opacity={0.03}>
      <div className="container mx-auto p-4 px-0">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* For mobile, display sidebar at top when on smaller screens */}
          {isMobile && (
            <div className="lg:col-span-1 mb-6">
              <VadeMecumSidebar favorites={favorites} recentHistory={recentHistory} />
            </div>
          )}
          
          <div className="lg:col-span-3">
            <VadeMecumHeader 
              title={decodedLawName} 
              searchQuery={searchQuery} 
              setSearchQuery={setSearchQuery} 
              onReload={() => loadArticles()} 
            />

            {cachedArticles.length === 0 && !loading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Nenhum artigo encontrado para esta lei.</p>
              </div>
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
          </div>
          
          {/* Only show sidebar in this position on desktop */}
          {!isMobile && (
            <div className="lg:col-span-1">
              <VadeMecumSidebar favorites={favorites} recentHistory={recentHistory} />
            </div>
          )}
        </div>

        {/* Bottom floating controls for font size and back to top */}
        <FloatingControls 
          fontSize={fontSize} 
          increaseFontSize={increaseFontSize} 
          decreaseFontSize={decreaseFontSize} 
          showBackToTop={showBackToTop} 
          scrollToTop={scrollToTop} 
        />
      </div>
    </JuridicalBackground>
  );
};

export default VadeMecumViewer;

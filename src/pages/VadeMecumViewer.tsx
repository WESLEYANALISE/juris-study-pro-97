
import { useState, useEffect } from "react";
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

const VadeMecumViewer = () => {
  // Initial batch size increased from 10 to 30
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

  // Use react-intersection-observer para detecção de "infinite scroll"
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.1,
    triggerOnce: false
  });
  
  const {
    filteredArticles,
    loading,
    error,
    loadArticles,
    decodedLawName,
    tableName
  } = useVadeMecumArticles(searchQuery);

  // Load view history
  useEffect(() => {
    if (user) {
      loadHistory().then(history => setRecentHistory(history || []));
    }
  }, [user, loadHistory]);

  // Calculate articles visible based on current batch
  const visibleArticles = filteredArticles.slice(0, visibleBatch);

  // Effect for loading more articles when user scrolls to bottom
  useEffect(() => {
    if (inView && filteredArticles.length > visibleBatch) {
      // Improved batch size - load more articles at once
      const batchSize = isMobile ? 10 : 20;
      setVisibleBatch(prev => prev + batchSize);
    }
  }, [inView, filteredArticles.length, visibleBatch, isMobile]);

  // Select the appropriate background based on law type
  const getBgVariant = () => {
    if (!tableName) return "books";
    
    const lawNameLower = tableName.toLowerCase();
    if (lawNameLower.includes('constituição') || lawNameLower.includes('constituicao')) return "constitution";
    if (lawNameLower.includes('código') || lawNameLower.includes('codigo')) return "constitution";
    if (lawNameLower.includes('estatuto')) return "courthouse";
    if (lawNameLower.includes('lei')) return "scales";
    
    return "books";
  };

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
    <JuridicalBackground variant={getBgVariant()} opacity={0.03}>
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

            {filteredArticles.length === 0 && !loading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Nenhum artigo encontrado para esta lei.</p>
              </div>
            ) : (
              <VadeMecumArticleList 
                isLoading={loading} 
                visibleArticles={visibleArticles} 
                filteredArticles={filteredArticles} 
                visibleBatch={visibleBatch} 
                tableName={tableName} 
                fontSize={fontSize} 
                loadMoreRef={loadMoreRef} 
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

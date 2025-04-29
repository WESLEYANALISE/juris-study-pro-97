
import { useState } from "react";
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

const VadeMecumViewer = () => {
  const { searchQuery, setSearchQuery } = useVadeMecumSearch();
  const [visibleBatch, setVisibleBatch] = useState(10);
  const [recentHistory, setRecentHistory] = useState<any[]>([]);
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

  // Carregar histórico de visualização
  useState(() => {
    if (user) {
      loadHistory().then(history => setRecentHistory(history || []));
    }
  });

  // Calcular artigos visíveis baseado no batch atual
  const visibleArticles = filteredArticles.slice(0, visibleBatch);

  // Efeito para carregar mais artigos quando o usuário rolar até o final da página
  useState(() => {
    if (inView && filteredArticles.length > visibleBatch) {
      const batchSize = isMobile ? 5 : 10;
      setVisibleBatch(prev => prev + batchSize);
    }
  });

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
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
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
        
        {/* Sidebar with Favorites and History */}
        <VadeMecumSidebar 
          favorites={favorites} 
          recentHistory={recentHistory} 
        />
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
  );
};

export default VadeMecumViewer;

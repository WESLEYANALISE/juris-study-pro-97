
import { useState, useEffect, useCallback, useRef } from "react";
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
import { useVadeMecumArticlesOptimized } from "@/hooks/useVadeMecumArticlesOptimized";
import { JuridicalBackgroundOptimized } from "@/components/ui/juridical-background-optimized";
import { useParams, useNavigate } from "react-router-dom";
import { BookOpen } from "lucide-react";
import { Container } from "@/components/ui/container";

// Define a type for the supported background variants
type VadeMecumBackgroundVariant = "scales" | "books" | "constitution";

const VadeMecumViewer = () => {
  const navigate = useNavigate();
  const { lawId } = useParams<{ lawId: string }>();

  // Menor tamanho inicial de lote para melhor performance
  const [visibleBatch, setVisibleBatch] = useState(15);
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

  // Use react-intersection-observer com limiar menor para melhor performance
  const { ref, inView } = useInView({
    threshold: 0.05,
    triggerOnce: false
  });

  // Use nosso hook otimizado
  const {
    filteredArticles,
    loading,
    error,
    loadArticles,
    decodedLawName,
    tableName
  } = useVadeMecumArticlesOptimized(searchQuery);

  // Connect the intersection observer ref with our React ref
  const setRefs = useCallback((node: HTMLDivElement | null) => {
    // Call the ref function from useInView
    ref(node);
  }, [ref]);

  // Load view history
  useEffect(() => {
    if (user) {
      loadHistory().then(history => setRecentHistory(history || []));
    }
  }, [user, loadHistory]);

  // Calculate articles visible based on current batch
  const visibleArticles = filteredArticles.slice(0, visibleBatch);

  // Effect for loading more articles when user scrolls to bottom - otimizado
  useEffect(() => {
    if (inView && filteredArticles.length > visibleBatch) {
      // Tamanho de lote menor para dispositivos móveis
      const batchSize = isMobile ? 10 : 20;
      setVisibleBatch(prev => prev + batchSize);
    }
  }, [inView, filteredArticles.length, visibleBatch, isMobile]);

  // Selecionar variante de fundo com base no tipo de lei - memoizado
  const getBgVariant = useCallback((): VadeMecumBackgroundVariant => {
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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh] py-12">
        <div className="text-center space-y-4">
          <LoadingSpinner className="h-10 w-10 mx-auto text-primary" />
          <p className="text-muted-foreground">Carregando artigos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return <VadeMecumError error={error} onRetry={() => loadArticles()} />;
  }

  return (
    <JuridicalBackgroundOptimized variant={getBgVariant()} opacity={0.03}>
      <Container size="xl" className="p-4 py-6 px-0">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Para mobile, mostrar sidebar no topo */}
          {isMobile && (
            <div className="lg:col-span-1 mb-2">
              <VadeMecumSidebar favorites={favorites} recentHistory={recentHistory} />
            </div>
          )}
          
          <div className="lg:col-span-3 px-[10px]">
            <VadeMecumHeader 
              title={decodedLawName} 
              searchQuery={searchQuery} 
              setSearchQuery={setSearchQuery} 
              onReload={loadArticles} 
            />

            {filteredArticles.length === 0 && !loading ? (
              <div className="text-center py-12 bg-background/30 backdrop-blur-sm rounded-lg border border-primary/20">
                <BookOpen className="h-16 w-16 mx-auto text-muted-foreground opacity-30 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Nenhum artigo encontrado</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Não encontramos nenhum artigo que corresponda aos seus critérios de busca.
                </p>
              </div>
            ) : (
              <VadeMecumArticleList 
                isLoading={loading} 
                data={filteredArticles} 
                filter={searchQuery} 
                tableName={tableName || ''} 
                visibleArticles={visibleArticles} 
                loadMoreRef={setRefs}
              />
            )}
          </div>
          
          {/* Mostrar sidebar apenas nesta posição em desktop */}
          {!isMobile && (
            <div className="lg:col-span-1">
              <VadeMecumSidebar favorites={favorites} recentHistory={recentHistory} />
            </div>
          )}
        </div>

        {/* Controles flutuantes no fundo para tamanho da fonte e voltar ao topo */}
        <FloatingControls 
          fontSize={fontSize} 
          increaseFontSize={increaseFontSize} 
          decreaseFontSize={decreaseFontSize} 
          showBackToTop={showBackToTop} 
          scrollToTop={scrollToTop} 
        />
      </Container>
    </JuridicalBackgroundOptimized>
  );
};

export default VadeMecumViewer;

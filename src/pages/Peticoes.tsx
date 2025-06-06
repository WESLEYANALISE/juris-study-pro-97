import { useState, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { PeticaoSearch } from "@/components/peticoes/PeticaoSearch";
import { Button } from "@/components/ui/button";
import { FileText, DownloadCloud, Eye, BookOpen, Filter, BarChart3, History, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { DataCard } from "@/components/ui/data-card";
import { JuridicalCard } from "@/components/ui/juridical-card";
import { PeticaoCard } from "@/components/peticoes/PeticaoCard";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePeticoes } from "@/hooks/usePeticoes";
import { useRecentPeticoes } from "@/hooks/useRecentPeticoes";
import { PeticaoFilters } from "@/components/peticoes/PeticaoFilters";
import { DataPagination } from "@/components/ui/data-pagination";
import { LoadingState } from "@/components/ui/loading-state";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

// Lazy-load the PeticaoViewer to reduce initial bundle size
const PeticaoViewer = lazy(() => import("@/components/peticoes/PeticaoViewerExport").then(module => ({
  default: module.PeticaoViewer
})));
const Peticoes = () => {
  // Basic states
  const [searchQuery, setSearchQuery] = useState("");
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedPeticaoUrl, setSelectedPeticaoUrl] = useState<string | null>(null);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;
  const navigate = useNavigate();

  // Use our custom hooks with pagination
  const {
    peticoes,
    peticoesByArea,
    areaStats,
    filters,
    setFilters,
    isLoading,
    isFetching,
    totalPeticoes,
    totalAreas,
    totalPages
  } = usePeticoes({
    initialFilters: {
      area: "",
      subArea: "",
      tipo: "",
      tags: [],
      search: searchQuery
    },
    page: currentPage,
    pageSize
  });
  const {
    recentItems,
    addRecentItem,
    clearRecentItems
  } = useRecentPeticoes();

  // Handle document view
  const handleViewPeticao = (peticao: any) => {
    const url = peticao.arquivo_url || peticao.link;
    setSelectedPeticaoUrl(url);
    setViewerOpen(true);

    // Add to recently viewed
    addRecentItem({
      id: peticao.id,
      title: peticao.titulo || peticao.tipo,
      area: peticao.area,
      url: url
    });
  };
  const handleCloseViewer = () => {
    setViewerOpen(false);
    setSelectedPeticaoUrl(null);
  };

  // Handle search updates - with debounce
  const updateSearchQuery = (value: string) => {
    setSearchQuery(value);
    setFilters(prev => ({
      ...prev,
      search: value
    }));
  };

  // Handle page changes
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top when changing page
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
  return <div className="container max-w-7xl mx-auto py-[15px] px-[8px]">
      {viewerOpen && selectedPeticaoUrl && <Suspense fallback={<div className="fixed inset-0 bg-background z-50 flex items-center justify-center"><LoadingSpinner size="lg" /></div>}>
          <PeticaoViewer url={selectedPeticaoUrl} onBack={handleCloseViewer} />
        </Suspense>}
      
      <div className="relative">
        {/* Background texture */}
        <div className="absolute inset-0 bg-texture-dots opacity-5 pointer-events-none"></div>
        
        {/* Header section */}
        <div className="relative z-10">
          <div className="flex flex-col space-y-4">
            <div className="flex flex-wrap gap-4 items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Petições e Modelos Jurídicos
                </h1>
                <p className="text-muted-foreground mt-2">
                  Acesse modelos de petições para agilizar seu trabalho jurídico
                </p>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Sheet open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Filter className="h-4 w-4" />
                      Filtros
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right">
                    <SheetHeader>
                      <SheetTitle>Filtros de Petições</SheetTitle>
                      <SheetDescription>
                        Filtre os modelos por área, subárea ou tipo
                      </SheetDescription>
                    </SheetHeader>
                    <div className="mt-6">
                      <PeticaoFilters filters={filters} setFilters={setFilters} />
                    </div>
                  </SheetContent>
                </Sheet>
                <Button variant="primary" size="sm" className="gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Estatísticas
                </Button>
              </div>
            </div>
            
            {/* Statistics cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <DataCard title="Total de Petições" icon={<FileText className="h-4 w-4" />} variant="primary">
                <div className="text-2xl font-bold">{totalPeticoes}</div>
                <p className="text-sm text-muted-foreground">Modelos disponíveis</p>
              </DataCard>
              
              <DataCard title="Áreas do Direito" icon={<BookOpen className="h-4 w-4" />} variant="default">
                <div className="text-2xl font-bold">{totalAreas}</div>
                <p className="text-sm text-muted-foreground">Categorias disponíveis</p>
              </DataCard>
              
              <DataCard title="Últimas atualizações" icon={<DownloadCloud className="h-4 w-4" />} variant="primary">
                <div className="text-sm">Novos modelos adicionados recentemente</div>
              </DataCard>
            </div>

            {/* Search bar */}
            <div className="mt-6 mb-4">
              <PeticaoSearch value={searchQuery} onChange={updateSearchQuery} />
            </div>
          </div>
          
          {/* Tabs for different views */}
          <Tabs defaultValue="areas" className="mt-6">
            <TabsList className="mb-4">
              <TabsTrigger value="areas">Por Área</TabsTrigger>
              <TabsTrigger value="recentes">Recentes</TabsTrigger>
              <TabsTrigger value="todos">Todos</TabsTrigger>
            </TabsList>
            
            <TabsContent value="areas">
              {isLoading ? <LoadingState variant="skeleton" count={6} /> : Object.keys(peticoesByArea).length === 0 ? <div className="text-center py-12 bg-card/30 backdrop-blur-sm rounded-lg border border-white/5 shadow-lg">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground opacity-30" />
                  <h3 className="mt-4 text-lg font-semibold">Nenhuma petição encontrada</h3>
                  <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
                    Tente ajustar seus termos de busca ou limpar os filtros para ver mais resultados
                  </p>
                  {(filters.area || filters.subArea || filters.tipo || filters.search) && <Button variant="link" onClick={() => setFilters({
                area: "",
                subArea: "",
                tipo: "",
                tags: [],
                search: ""
              })} className="mt-4">
                      Limpar todos os filtros
                    </Button>}
                </div> : <ScrollArea className="pr-4">
                  <div className="space-y-8">
                    <AnimatePresence mode="wait">
                      {Object.entries(peticoesByArea).map(([area, areaPeticoes]) => <motion.section key={area} initial={{
                    opacity: 0,
                    y: 10
                  }} animate={{
                    opacity: 1,
                    y: 0
                  }} exit={{
                    opacity: 0,
                    y: -10
                  }} transition={{
                    duration: 0.3
                  }} className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <h2 className="text-xl font-semibold">{area}</h2>
                              <Badge variant="outline" className="ml-2">
                                {areaPeticoes.length} {areaPeticoes.length === 1 ? 'modelo' : 'modelos'}
                              </Badge>
                            </div>
                            
                            <Button variant="ghost" size="sm" onClick={() => setFilters(prev => ({
                        ...prev,
                        area: prev.area === area ? "" : area
                      }))} className="text-xs">
                              {filters.area === area ? 'Limpar filtro' : 'Filtrar por esta área'}
                            </Button>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {areaPeticoes.map(peticao => <PeticaoCard key={peticao.id} peticao={{
                        id: peticao.id,
                        area: peticao.area,
                        sub_area: peticao.sub_area,
                        tipo: peticao.tipo,
                        link: peticao.arquivo_url,
                        descricao: peticao.descricao || '',
                        tags: peticao.tags
                      }} onView={() => handleViewPeticao(peticao)} />)}
                          </div>
                        </motion.section>)}
                    </AnimatePresence>
                  </div>
                </ScrollArea>}
              
              {/* Show pagination only when needed */}
              {totalPages > 1 && <div className="mt-6">
                  <DataPagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} className="justify-center" />
                </div>}
              
              {/* Show loading indicator when fetching new page */}
              {isFetching && !isLoading && <div className="flex justify-center my-4">
                  <LoadingSpinner size="sm" />
                </div>}
            </TabsContent>
            
            <TabsContent value="recentes">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold">Visualizados Recentemente</h2>
                
                {recentItems && recentItems.length > 0 && <Button variant="outline" size="sm" onClick={clearRecentItems} className="gap-2 text-xs">
                    <Trash2 className="h-3.5 w-3.5" />
                    Limpar histórico
                  </Button>}
              </div>
              
              {!recentItems || recentItems.length === 0 ? <div className="text-center py-12 bg-card/30 backdrop-blur-sm rounded-lg border border-white/5 shadow-lg">
                  <History className="mx-auto h-12 w-12 text-muted-foreground opacity-30" />
                  <h3 className="mt-4 text-lg font-semibold">Nenhum documento visualizado recentemente</h3>
                  <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
                    Os documentos que você visualizar aparecerão aqui para acesso rápido
                  </p>
                </div> : <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {recentItems.map(recentItem => <JuridicalCard key={`${recentItem.id}-${recentItem.viewedAt}`} title={recentItem.title} description={recentItem.area} icon="scroll" variant="primary" onClick={() => {
                setSelectedPeticaoUrl(recentItem.url);
                setViewerOpen(true);
              }}>
                      <div className="text-sm text-muted-foreground mb-2">
                        Visualizado {new Date(recentItem.viewedAt).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-muted-foreground mb-4">
                        Clique para abrir novamente o documento
                      </div>
                      <Button onClick={() => {
                  setSelectedPeticaoUrl(recentItem.url);
                  setViewerOpen(true);
                }} className="w-full" variant="gradient">
                        <Eye className="mr-2 h-4 w-4" />
                        Visualizar
                      </Button>
                    </JuridicalCard>)}
                </div>}
              
              {peticoes && peticoes.length > 0 && <div className="mt-8">
                  <h2 className="text-xl font-semibold mb-4">Petições Disponíveis</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {peticoes.slice(0, 6).map(peticao => <JuridicalCard key={peticao.id} title={peticao.tipo} description={peticao.area} icon="scroll" variant="primary" onClick={() => handleViewPeticao(peticao)}>
                        <div className="text-sm text-muted-foreground line-clamp-2 mb-4">
                          {peticao.descricao || "Modelo de petição para uso profissional."}
                        </div>
                        <Button onClick={() => handleViewPeticao(peticao)} className="w-full" variant="gradient">
                          <Eye className="mr-2 h-4 w-4" />
                          Visualizar
                        </Button>
                      </JuridicalCard>)}
                  </div>
                </div>}
            </TabsContent>
            
            <TabsContent value="todos">
              {isLoading ? <LoadingState variant="skeleton" count={12} /> : !peticoes || peticoes.length === 0 ? <div className="text-center py-12 bg-card/30 backdrop-blur-sm rounded-lg border border-white/5 shadow-lg">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground opacity-30" />
                  <h3 className="mt-4 text-lg font-semibold">Nenhuma petição encontrada</h3>
                  <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
                    Tente ajustar seus termos de busca ou limpar os filtros para ver mais resultados
                  </p>
                </div> : <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {peticoes.map(peticao => <Card key={peticao.id} className="h-full flex flex-col bg-gradient-to-br from-background/60 to-background/90 border-white/5 shadow-lg hover:shadow-xl transition-all duration-300">
                        <CardHeader>
                          <CardTitle>{peticao.tipo}</CardTitle>
                          <CardDescription>{peticao.area}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow">
                          {peticao.descricao || "Modelo de petição para uso profissional."}
                        </CardContent>
                        <CardFooter className="border-t border-white/5 bg-black/20 pt-4">
                          <div className="flex gap-2 w-full">
                            <Button onClick={() => handleViewPeticao(peticao)} className="flex-1" variant="default">
                              <Eye className="mr-2 h-4 w-4" />
                              Visualizar
                            </Button>
                            <Button onClick={() => window.open(peticao.arquivo_url, "_blank")} variant="outline">
                              <DownloadCloud className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardFooter>
                      </Card>)}
                  </div>
                  
                  {/* Pagination for "todos" tab */}
                  {totalPages > 1 && <div className="mt-6">
                      <DataPagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} className="justify-center" />
                    </div>}
                  
                  {/* Show loading indicator when fetching new page */}
                  {isFetching && !isLoading && <div className="flex justify-center my-4">
                      <LoadingSpinner size="sm" />
                    </div>}
                </>}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>;
};
export default Peticoes;
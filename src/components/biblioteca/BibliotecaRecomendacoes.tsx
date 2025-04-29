
import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Search, BookOpen, Bookmark, TrendingUp } from "lucide-react";
import { 
  Card, 
  CardContent 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PDFViewer } from "./PDFViewer";
import { useToast } from "@/hooks/use-toast";
import { FloatingControls } from "@/components/vademecum/FloatingControls";
import { calculateNextReview, getNextReviewDate } from "@/utils/spacedRepetition";
import type { LivroPro } from "@/types/livrospro";

export function BibliotecaRecomendacoes() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedBook, setSelectedBook] = useState<LivroPro | null>(null);
  const [recommendations, setRecommendations] = useState<LivroPro[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<LivroPro[]>([]);
  const [activeTab, setActiveTab] = useState<"todas" | "recentes" | "recomendados" | "populares">("todas");
  const { toast } = useToast();

  // Buscar livros
  const { data: livros, isLoading } = useQuery({
    queryKey: ["livrospro"],
    queryFn: async () => {
      const { data, error } = await supabase.from("livrospro").select("*");
      if (error) {
        console.error("Error fetching books:", error);
        toast({
          title: "Erro ao carregar livros",
          description: "Não foi possível carregar a biblioteca. Por favor, tente novamente.",
          variant: "destructive"
        });
        return [];
      }
      return (data as any[] ?? []) as LivroPro[];
    }
  });

  // Buscar histórico de visualizações do usuário
  const { data: viewHistory } = useQuery({
    queryKey: ["livrospro-history"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("livrospro_progresso")
        .select("*")
        .order("updated_at", { ascending: false })
        .limit(5);
      
      if (error) {
        console.error("Error fetching view history:", error);
        return [];
      }
      return data;
    }
  });

  // Categorias disponíveis
  const categorias = useMemo(() => {
    if (!livros) return [];
    return Array.from(new Set(livros.map(l => l.categoria).filter(Boolean)));
  }, [livros]);

  // Livros filtrados por pesquisa e categoria
  const filteredLivros = useMemo(() => {
    if (!livros) return [];
    
    let filtered = livros;
    
    if (activeCategory) {
      filtered = filtered.filter(livro => livro.categoria === activeCategory);
    }
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(livro => 
        (livro.nome || "").toLowerCase().includes(searchLower) ||
        (livro.categoria || "").toLowerCase().includes(searchLower) ||
        (livro.descricao || "").toLowerCase().includes(searchLower)
      );
    }
    
    return filtered;
  }, [searchTerm, activeCategory, livros]);

  // Livros recentemente visualizados
  useEffect(() => {
    if (viewHistory && livros) {
      const viewed = viewHistory
        .map(history => livros.find(l => l.id === history.livro_id))
        .filter(Boolean) as LivroPro[];
      setRecentlyViewed(viewed);
    }
  }, [viewHistory, livros]);

  // Recomendações baseadas em interesses do usuário
  useEffect(() => {
    if (!livros) return;
    
    // Lógica simples de recomendação - categorias mais visualizadas
    const viewedCategories = recentlyViewed.map(book => book.categoria);
    const mostViewedCategories = [...new Set(viewedCategories)];
    
    const recommended = livros
      .filter(book => mostViewedCategories.includes(book.categoria))
      .filter(book => !recentlyViewed.some(viewed => viewed.id === book.id))
      .slice(0, 6);
    
    // Se não houver histórico, mostrar alguns livros populares
    if (recommended.length === 0 && livros.length > 0) {
      setRecommendations(livros.slice(0, 6));
    } else {
      setRecommendations(recommended);
    }
  }, [livros, recentlyViewed]);

  // Função para registrar a visualização do livro
  const trackBookView = async (bookId: string) => {
    try {
      const newHistory = {
        livro_id: bookId,
        timestamp: new Date().toISOString()
      };
      
      await supabase.from("livros_historico_visualizacao").upsert(newHistory);
    } catch (error) {
      console.error("Error tracking book view:", error);
    }
  };

  // Manipulador para selecionar um livro
  const handleSelectBook = (livro: LivroPro) => {
    setSelectedBook(livro);
    trackBookView(livro.id);
  };

  if (selectedBook) {
    return <PDFViewer livro={selectedBook} onClose={() => setSelectedBook(null)} />;
  }

  // Verificar se não há livros para exibir aviso
  const noResults = filteredLivros.length === 0 && !isLoading;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div className="flex-1 flex flex-col gap-2">
          <div className="relative">
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Pesquisar livro, tema ou categoria..."
              className="pr-10"
            />
            <Search className="absolute right-3 top-2.5 h-5 w-5 text-muted-foreground" />
          </div>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="mb-6">
        <TabsList className="mb-2 flex flex-wrap">
          <TabsTrigger value="todas">Todas as categorias</TabsTrigger>
          <TabsTrigger value="recentes">Recentes</TabsTrigger>
          <TabsTrigger value="recomendados">Para Você</TabsTrigger>
          <TabsTrigger value="populares">Populares</TabsTrigger>
        </TabsList>
        
        <TabsContent value="todas">
          <div className="mb-2 overflow-x-auto py-2 -mx-4 px-4">
            <div className="flex gap-2 min-w-max">
              <Button 
                variant={activeCategory === null ? "default" : "outline"} 
                onClick={() => setActiveCategory(null)}
                size="sm"
                className="whitespace-nowrap"
              >
                Todas as categorias
              </Button>
              {categorias.map(categoria => (
                <Button 
                  key={categoria} 
                  variant={activeCategory === categoria ? "default" : "outline"}
                  onClick={() => setActiveCategory(categoria)}
                  size="sm"
                  className="whitespace-nowrap"
                >
                  {categoria}
                </Button>
              ))}
            </div>
          </div>
          
          {renderBookGrid(filteredLivros, isLoading, noResults)}
        </TabsContent>
        
        <TabsContent value="recentes">
          {recentlyViewed.length === 0 ? (
            <div className="text-center py-10">
              <BookOpen className="mx-auto h-12 w-12 text-muted-foreground opacity-20 mb-2" />
              <p className="text-muted-foreground">Você ainda não visualizou nenhum livro</p>
              <Button 
                variant="link" 
                onClick={() => setActiveTab("todas")}
                className="mt-2"
              >
                Explore a biblioteca
              </Button>
            </div>
          ) : (
            renderBookGrid(recentlyViewed, false, false)
          )}
        </TabsContent>
        
        <TabsContent value="recomendados">
          {recommendations.length === 0 ? (
            <div className="text-center py-10">
              <TrendingUp className="mx-auto h-12 w-12 text-muted-foreground opacity-20 mb-2" />
              <p className="text-muted-foreground">Continue explorando para receber recomendações personalizadas</p>
              <Button 
                variant="link" 
                onClick={() => setActiveTab("todas")}
                className="mt-2"
              >
                Explorar mais livros
              </Button>
            </div>
          ) : (
            renderBookGrid(recommendations, false, false)
          )}
        </TabsContent>
        
        <TabsContent value="populares">
          {isLoading ? (
            <div className="text-center py-20">Carregando…</div>
          ) : (
            renderBookGrid(livros?.slice(0, 8) || [], false, false)
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
  
  // Função para renderizar a grade de livros
  function renderBookGrid(books: LivroPro[], isLoading: boolean, noResults: boolean) {
    if (isLoading) {
      return <div className="text-center py-20">Carregando…</div>;
    }
    
    if (noResults) {
      return (
        <div className="text-center py-10">
          <p className="text-muted-foreground">Nenhum livro encontrado para a sua pesquisa</p>
          {activeCategory && (
            <Button 
              variant="link" 
              onClick={() => setActiveCategory(null)}
              className="mt-2"
            >
              Limpar filtro de categoria
            </Button>
          )}
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
        {books.map(livro => (
          <Card 
            key={livro.id} 
            className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
            onClick={() => handleSelectBook(livro)}
          >
            <div className="aspect-[3/4] relative overflow-hidden">
              {livro.capa_url ? (
                <img 
                  src={livro.capa_url} 
                  alt={livro.nome}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground">
                  <BookOpen className="h-12 w-12 opacity-30" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                <div className="p-4 w-full">
                  <h3 className="font-semibold text-white line-clamp-2">{livro.nome}</h3>
                  <p className="text-xs text-white/80 mt-1">
                    {livro.categoria}
                    {livro.total_paginas ? ` • ${livro.total_paginas} páginas` : ''}
                  </p>
                </div>
              </div>
              
              {/* Ícone de marcador para livros recentes ou favoritos */}
              {recentlyViewed.some(book => book.id === livro.id) && (
                <div className="absolute top-2 right-2 bg-primary/80 text-white p-1 rounded-full">
                  <Bookmark className="h-4 w-4" />
                </div>
              )}
            </div>
            <CardContent className="p-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {livro.descricao || "Sem descrição disponível."}
                </p>
                <Button variant="secondary" className="w-full" size="sm">
                  Ler agora
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
}


import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search } from "lucide-react";
import { PDFViewer } from "./PDFViewer";
import { useToast } from "@/hooks/use-toast";
import { RecomendacoesTabContent } from "./RecomendacoesTabContent";
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
      try {
        const { data, error } = await supabase.functions.invoke("get_view_history");
        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error("Error fetching view history:", error);
        return [];
      }
    }
  });

  // Livros recentemente visualizados
  useEffect(() => {
    if (viewHistory && livros) {
      // Ensure viewHistory is an array before mapping
      if (Array.isArray(viewHistory)) {
        const viewed = viewHistory
          .map((history: any) => livros.find(l => l.id === history.livro_id))
          .filter(Boolean) as LivroPro[];
        setRecentlyViewed(viewed);
      }
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
      await supabase.functions.invoke("track_book_view", { 
        body: { livro_id: bookId }
      });
    } catch (error) {
      console.error("Error tracking book view:", error);
    }
  };

  // Manipulador para selecionar um livro
  const handleSelectBook = (livro: LivroPro) => {
    if (!livro.pdf) {
      toast({
        title: "PDF não disponível",
        description: "Este livro não possui um arquivo PDF associado.",
        variant: "destructive"
      });
      return;
    }
    
    setSelectedBook(livro);
    trackBookView(livro.id);
  };

  if (selectedBook) {
    return <PDFViewer livro={selectedBook} onClose={() => setSelectedBook(null)} />;
  }

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
        
        <RecomendacoesTabContent
          activeTab={activeTab}
          livros={livros}
          isLoading={isLoading}
          recentlyViewed={recentlyViewed}
          recommendations={recommendations}
          searchTerm={searchTerm}
          setActiveTab={setActiveTab}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          handleSelectBook={handleSelectBook}
        />
      </Tabs>
    </div>
  );
}

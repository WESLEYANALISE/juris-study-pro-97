
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Search } from "lucide-react";
import { 
  Card, 
  CardContent 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PDFViewer } from "./PDFViewer";
import type { LivroPro } from "@/types/livrospro";

export function BibliotecaRecomendacoes() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedBook, setSelectedBook] = useState<LivroPro | null>(null);

  const { data: livros, isLoading } = useQuery({
    queryKey: ["livrospro"],
    queryFn: async () => {
      const { data } = await supabase.from("livrospro").select("*");
      return (data as any[] ?? []) as LivroPro[];
    }
  });

  const categorias = useMemo(() => {
    if (!livros) return [];
    return Array.from(new Set(livros.map(l => l.categoria).filter(Boolean)));
  }, [livros]);

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
      
      <Tabs defaultValue="todas" className="mb-6">
        <TabsList className="mb-2 flex flex-wrap">
          <TabsTrigger 
            value="todas" 
            onClick={() => setActiveCategory(null)}
          >
            Todas as categorias
          </TabsTrigger>
          {categorias.map(categoria => (
            <TabsTrigger 
              key={categoria} 
              value={categoria}
              onClick={() => setActiveCategory(categoria)}
            >
              {categoria}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      
      {isLoading ? (
        <div className="text-center py-20">Carregando…</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredLivros.map(livro => (
            <Card 
              key={livro.id} 
              className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setSelectedBook(livro)}
            >
              <div className="aspect-[3/4] relative overflow-hidden">
                {livro.capa_url ? (
                  <img 
                    src={livro.capa_url} 
                    alt={livro.nome}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" 
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground">
                    Sem capa
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
      )}
      
      {filteredLivros.length === 0 && !isLoading && (
        <div className="text-center py-10">
          <p className="text-muted-foreground">Nenhum livro encontrado para a sua pesquisa</p>
        </div>
      )}
    </div>
  );
}

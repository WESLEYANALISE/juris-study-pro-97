
import { useState, useMemo } from "react";
import { TabsContent } from "@/components/ui/tabs";
import { BookGrid } from "./BookGrid";
import { EmptyState } from "./EmptyState";
import { CategoryFilter } from "./CategoryFilter";
import type { LivroPro } from "@/types/livrospro";

interface RecomendacoesTabContentProps {
  activeTab: string;
  livros: LivroPro[] | undefined;
  isLoading: boolean;
  recentlyViewed: LivroPro[];
  recommendations: LivroPro[];
  searchTerm: string;
  setActiveTab: (tab: "todas" | "recentes" | "recomendados" | "populares") => void;
  activeCategory: string | null;
  setActiveCategory: (category: string | null) => void;
  handleSelectBook: (book: LivroPro) => void;
}

export function RecomendacoesTabContent({
  activeTab,
  livros,
  isLoading,
  recentlyViewed,
  recommendations,
  searchTerm,
  setActiveTab,
  activeCategory,
  setActiveCategory,
  handleSelectBook
}: RecomendacoesTabContentProps) {
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
  
  // Verificar se não há livros para exibir aviso
  const noResults = filteredLivros.length === 0 && !isLoading;

  return (
    <>
      <TabsContent value="todas">
        <CategoryFilter 
          categories={categorias} 
          activeCategory={activeCategory} 
          onSelectCategory={setActiveCategory} 
        />
        
        <BookGrid 
          books={filteredLivros}
          isLoading={isLoading}
          noResults={noResults}
          onSelectBook={handleSelectBook}
          recentlyViewed={recentlyViewed}
          activeCategory={activeCategory}
          onClearCategory={() => setActiveCategory(null)}
        />
      </TabsContent>
      
      <TabsContent value="recentes">
        {recentlyViewed.length === 0 ? (
          <EmptyState type="recent" onExplore={() => setActiveTab("todas")} />
        ) : (
          <BookGrid 
            books={recentlyViewed}
            isLoading={false}
            noResults={false}
            onSelectBook={handleSelectBook}
            recentlyViewed={recentlyViewed}
          />
        )}
      </TabsContent>
      
      <TabsContent value="recomendados">
        {recommendations.length === 0 ? (
          <EmptyState type="recommended" onExplore={() => setActiveTab("todas")} />
        ) : (
          <BookGrid 
            books={recommendations}
            isLoading={false}
            noResults={false}
            onSelectBook={handleSelectBook}
            recentlyViewed={recentlyViewed}
          />
        )}
      </TabsContent>
      
      <TabsContent value="populares">
        {isLoading ? (
          <div className="text-center py-20">Carregando…</div>
        ) : (
          <BookGrid 
            books={livros?.slice(0, 8) || []}
            isLoading={false}
            noResults={false}
            onSelectBook={handleSelectBook}
            recentlyViewed={recentlyViewed}
          />
        )}
      </TabsContent>
    </>
  );
}

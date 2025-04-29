
import { BookOpen, Bookmark } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { LivroPro } from "@/types/livrospro";

interface BookGridProps {
  books: LivroPro[];
  isLoading: boolean;
  noResults: boolean;
  onSelectBook: (book: LivroPro) => void;
  recentlyViewed?: LivroPro[];
  activeCategory?: string | null;
  onClearCategory?: () => void;
}

export function BookGrid({
  books,
  isLoading,
  noResults,
  onSelectBook,
  recentlyViewed = [],
  activeCategory,
  onClearCategory
}: BookGridProps) {
  if (isLoading) {
    return <div className="text-center py-20">Carregando…</div>;
  }
  
  if (noResults) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">Nenhum livro encontrado para a sua pesquisa</p>
        {activeCategory && onClearCategory && (
          <Button 
            variant="link" 
            onClick={onClearCategory}
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
          onClick={() => onSelectBook(livro)}
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

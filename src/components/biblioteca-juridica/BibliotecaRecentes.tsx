
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { LivroJuridico } from '@/types/biblioteca-juridica';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, BookOpen } from 'lucide-react';

interface BibliotecaRecentesProps {
  onSelectBook: (book: LivroJuridico) => void;
}

export function BibliotecaRecentes({ onSelectBook }: BibliotecaRecentesProps) {
  const { user } = useAuth();
  
  // First query to get recently viewed books IDs
  const { data: recentIds, isLoading: loadingIds } = useQuery({
    queryKey: ['biblioteca-recentes', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('biblioteca_leitura_progresso')
        .select('livro_id, ultima_leitura')
        .eq('user_id', user.id)
        .order('ultima_leitura', { ascending: false })
        .limit(8);
        
      if (error) {
        console.error('Error fetching recent books:', error);
        return [];
      }
      
      return data.map(item => item.livro_id);
    },
    enabled: !!user
  });
  
  // Second query to get the actual book details
  const { data: recentBooks, isLoading: loadingBooks } = useQuery({
    queryKey: ['biblioteca-recentes-details', recentIds],
    queryFn: async () => {
      if (!recentIds || recentIds.length === 0) return [];
      
      const { data, error } = await supabase
        .from('bibliotecatop')
        .select('*')
        .in('id', recentIds as unknown as number[]);
        
      if (error) {
        console.error('Error fetching recent books:', error);
        return [];
      }
      
      // Transform to match LivroJuridico type and preserve order from recentIds
      const booksMap = new Map(data.map(book => [book.id.toString(), book]));
      return recentIds
        .map(id => booksMap.get(id.toString()))
        .filter(Boolean)  // Remove any undefined entries
        .map(book => ({
          id: book!.id.toString(),
          titulo: book!.titulo || 'Sem título',
          categoria: book!.categoria || 'Geral',
          pdf_url: book!.pdf_url || '',
          capa_url: book!.capa_url || null,
          descricao: book!.descricao || null,
          total_paginas: book!.total_paginas ? parseInt(book!.total_paginas) : null
        })) as LivroJuridico[];
    },
    enabled: !!recentIds && recentIds.length > 0
  });
  
  const isLoading = loadingIds || loadingBooks;
  
  if (isLoading) {
    return (
      <div className="flex flex-wrap gap-4 mt-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="w-[calc(25%-0.75rem)] h-32 animate-pulse bg-muted rounded-lg"></div>
        ))}
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="text-center py-6 bg-muted/30 rounded-lg">
        <Clock className="h-10 w-10 mx-auto text-muted-foreground opacity-50 mb-2" />
        <h3 className="text-lg font-medium">Histórico de leitura</h3>
        <p className="text-muted-foreground">Faça login para acessar seu histórico</p>
      </div>
    );
  }
  
  if (!recentBooks || recentBooks.length === 0) {
    return (
      <div className="text-center py-6 bg-muted/30 rounded-lg">
        <Clock className="h-10 w-10 mx-auto text-muted-foreground opacity-50 mb-2" />
        <h3 className="text-lg font-medium">Nenhuma leitura recente</h3>
        <p className="text-muted-foreground">Você ainda não leu nenhum livro</p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-4">
      {recentBooks.map((book) => (
        <Card 
          key={book.id} 
          className="cursor-pointer overflow-hidden hover:shadow-md transition-shadow"
          onClick={() => onSelectBook(book)}
        >
          <CardContent className="p-0">
            <div className="aspect-square relative bg-muted">
              {book.capa_url ? (
                <img 
                  src={book.capa_url} 
                  alt={book.titulo}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder-book-cover.png';
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <BookOpen className="h-10 w-10 text-muted-foreground/30" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/0" />
              <div className="absolute bottom-0 left-0 right-0 p-2">
                <h3 className="text-sm font-medium text-white line-clamp-2">
                  {book.titulo}
                </h3>
                <p className="text-xs text-white/70 mt-1 line-clamp-1">
                  {book.categoria}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

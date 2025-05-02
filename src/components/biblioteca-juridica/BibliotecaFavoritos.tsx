
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { BibliotecaGridView } from './BibliotecaGridView';
import { LivroJuridico } from '@/types/biblioteca-juridica';
import { BookmarkX } from 'lucide-react';

interface BibliotecaFavoritosProps {
  onSelectBook: (book: LivroJuridico) => void;
}

export function BibliotecaFavoritos({
  onSelectBook
}: BibliotecaFavoritosProps) {
  const { user } = useAuth();

  const { data: favoriteBooks, isLoading } = useQuery({
    queryKey: ['biblioteca-favoritos', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      try {
        // Get user's favorites
        const { data: progressData, error: progressError } = await supabase
          .from('biblioteca_leitura_progresso')
          .select('livro_id')
          .eq('user_id', user.id)
          .eq('favorito', true);
        
        if (progressError) throw progressError;
        
        if (!progressData || progressData.length === 0) return [];
        
        // Get book details for favorites
        const favoriteIds = progressData.map(item => item.livro_id);
        const { data: booksData, error: booksError } = await supabase
          .from('biblioteca_juridica10')
          .select('*')
          .in('id', favoriteIds);
        
        if (booksError) throw booksError;
        return booksData as LivroJuridico[];
      } catch (err) {
        console.error('Error fetching favorites:', err);
        return [];
      }
    },
    enabled: !!user
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!favoriteBooks || favoriteBooks.length === 0) {
    return (
      <div className="py-8 flex flex-col items-center justify-center text-center border border-dashed rounded-lg">
        <BookmarkX className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">Nenhum favorito ainda</h3>
        <p className="text-muted-foreground max-w-sm">
          Marque livros como favoritos para acessá-los rapidamente depois
        </p>
      </div>
    );
  }

  return (
    <BibliotecaGridView 
      books={favoriteBooks}
      onSelectBook={onSelectBook}
    />
  );
}
